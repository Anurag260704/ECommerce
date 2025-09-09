const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters'],
        unique: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        sparse: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        url: {
            type: String,
            default: ''
        },
        alt: {
            type: String,
            default: ''
        }
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    children: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    level: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    productCount: {
        type: Number,
        default: 0
    },
    seoTitle: {
        type: String,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    seoDescription: {
        type: String,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
        type: String,
        trim: true
    }],
    metaData: {
        color: {
            type: String,
            default: '#3B82F6'
        },
        icon: {
            type: String,
            default: 'category'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ sortOrder: 1 });

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
    if (!this.slug || this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            remove: /[*+~.()'\'"!:@]/g
        });
    }
    next();
});

// Also handle insertMany operations
categorySchema.pre('insertMany', function(next, docs) {
    if (Array.isArray(docs)) {
        docs.forEach(doc => {
            if (!doc.slug && doc.name) {
                doc.slug = slugify(doc.name, {
                    lower: true,
                    strict: true,
                    remove: /[*+~.()'\'"!:@]/g
                });
            }
        });
    }
    next();
});

// Update children when parent is set
categorySchema.pre('save', async function(next) {
    if (this.isModified('parent') && this.parent) {
        // Add this category to parent's children array
        await this.constructor.findByIdAndUpdate(
            this.parent,
            { $addToSet: { children: this._id } }
        );
        
        // Set level based on parent
        const parent = await this.constructor.findById(this.parent);
        if (parent) {
            this.level = parent.level + 1;
        }
    }
    next();
});

// Remove from parent's children when category is removed
categorySchema.pre('remove', async function(next) {
    if (this.parent) {
        await this.constructor.findByIdAndUpdate(
            this.parent,
            { $pull: { children: this._id } }
        );
    }
    
    // Remove all children categories
    await this.constructor.deleteMany({ parent: this._id });
    
    next();
});

// Virtual for full category path
categorySchema.virtual('fullPath').get(function() {
    return this.parent ? `${this.parent.name} > ${this.name}` : this.name;
});

// Virtual for breadcrumbs
categorySchema.virtual('breadcrumbs').get(async function() {
    const breadcrumbs = [{ name: this.name, slug: this.slug }];
    let current = this;
    
    while (current.parent) {
        current = await this.constructor.findById(current.parent);
        if (current) {
            breadcrumbs.unshift({ name: current.name, slug: current.slug });
        }
    }
    
    return breadcrumbs;
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
    const categories = await this.find({ isActive: true })
        .sort({ level: 1, sortOrder: 1, name: 1 })
        .populate('children', 'name slug level isActive productCount');
    
    // Build tree structure
    const tree = [];
    const categoryMap = new Map();
    
    // First pass: create map of all categories
    categories.forEach(category => {
        categoryMap.set(category._id.toString(), {
            ...category.toObject(),
            children: []
        });
    });
    
    // Second pass: build tree structure
    categories.forEach(category => {
        if (category.parent) {
            const parent = categoryMap.get(category.parent.toString());
            if (parent) {
                parent.children.push(categoryMap.get(category._id.toString()));
            }
        } else {
            tree.push(categoryMap.get(category._id.toString()));
        }
    });
    
    return tree;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(limit = 8) {
    return this.find({ 
        isActive: true, 
        isFeatured: true 
    })
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .select('name slug description image productCount metaData');
};

// Static method to get top-level categories
categorySchema.statics.getTopLevel = function() {
    return this.find({ 
        isActive: true, 
        parent: null 
    })
    .sort({ sortOrder: 1, name: 1 })
    .populate('children', 'name slug productCount isActive')
    .select('name slug description image productCount children metaData');
};

// Instance method to get category hierarchy
categorySchema.methods.getHierarchy = async function() {
    const hierarchy = [];
    let current = this;
    
    hierarchy.unshift({
        _id: current._id,
        name: current.name,
        slug: current.slug,
        level: current.level
    });
    
    while (current.parent) {
        current = await this.constructor.findById(current.parent);
        if (current) {
            hierarchy.unshift({
                _id: current._id,
                name: current.name,
                slug: current.slug,
                level: current.level
            });
        }
    }
    
    return hierarchy;
};

// Instance method to update product count
categorySchema.methods.updateProductCount = async function() {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ 
        category: this._id, 
        isActive: true 
    });
    
    this.productCount = count;
    await this.save();
    
    return count;
};

// Static method to update all product counts
categorySchema.statics.updateAllProductCounts = async function() {
    const Product = mongoose.model('Product');
    const categories = await this.find({});
    
    for (const category of categories) {
        const count = await Product.countDocuments({ 
            category: category._id, 
            isActive: true 
        });
        category.productCount = count;
        await category.save();
    }
};

// Instance method to get all descendant categories
categorySchema.methods.getDescendants = async function() {
    const descendants = [];
    const children = await this.constructor.find({ parent: this._id });
    
    for (const child of children) {
        descendants.push(child);
        const childDescendants = await child.getDescendants();
        descendants.push(...childDescendants);
    }
    
    return descendants;
};

// Method to check if category can be deleted
categorySchema.methods.canBeDeleted = async function() {
    const Product = mongoose.model('Product');
    const productCount = await Product.countDocuments({ category: this._id });
    const childrenCount = await this.constructor.countDocuments({ parent: this._id });
    
    return productCount === 0 && childrenCount === 0;
};

module.exports = mongoose.model('Category', categorySchema);
