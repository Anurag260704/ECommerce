import api from './api';

class CategoryService {
    // Get all categories with optional filters
    async getCategories(params = {}) {
        try {
            console.log('Fetching categories with params:', params);
            
            const response = await api.get('/categories', { params });
            
            console.log('Categories fetched successfully:', response);
            return response;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch categories' 
            };
        }
    }

    // Get featured categories
    async getFeaturedCategories(limit = 8) {
        try {
            console.log(`Fetching featured categories (limit: ${limit})`);
            
            const response = await api.get('/categories/featured', {
                params: { limit }
            });
            
            console.log('Featured categories fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching featured categories:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch featured categories' 
            };
        }
    }

    // Get top-level categories (no parent)
    async getTopLevelCategories() {
        try {
            console.log('Fetching top-level categories');
            
            const response = await api.get('/categories/top-level');
            
            console.log('Top-level categories fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching top-level categories:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch top-level categories' 
            };
        }
    }

    // Get category tree structure
    async getCategoryTree() {
        try {
            console.log('Fetching category tree');
            
            const response = await api.get('/categories', {
                params: { tree: 'true' }
            });
            
            console.log('Category tree fetched:', response);
            return response;
        } catch (error) {
            console.error('Error fetching category tree:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch category tree' 
            };
        }
    }

    // Get single category by ID or slug
    async getCategory(identifier) {
        try {
            console.log(`Fetching category: ${identifier}`);
            
            const response = await api.get(`/categories/${identifier}`);
            
            console.log('Category fetched:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching category ${identifier}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch category' 
            };
        }
    }

    // Get products by category
    async getCategoryProducts(identifier, params = {}) {
        try {
            console.log(`Fetching products for category: ${identifier}`, params);
            
            const response = await api.get(`/categories/${identifier}/products`, {
                params
            });
            
            console.log('Category products fetched:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching products for category ${identifier}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to fetch category products' 
            };
        }
    }

    // Admin functions (require authentication)
    
    // Create new category (Admin only)
    async createCategory(categoryData) {
        try {
            console.log('Creating category:', categoryData);
            
            const response = await api.post('/categories', categoryData);
            
            console.log('Category created successfully:', response);
            return response;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to create category' 
            };
        }
    }

    // Update category (Admin only)
    async updateCategory(categoryId, categoryData) {
        try {
            console.log(`Updating category ${categoryId}:`, categoryData);
            
            const response = await api.put(`/categories/${categoryId}`, categoryData);
            
            console.log('Category updated successfully:', response);
            return response;
        } catch (error) {
            console.error(`Error updating category ${categoryId}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to update category' 
            };
        }
    }

    // Delete category (Admin only)
    async deleteCategory(categoryId) {
        try {
            console.log(`Deleting category: ${categoryId}`);
            
            const response = await api.delete(`/categories/${categoryId}`);
            
            console.log('Category deleted successfully:', response);
            return response;
        } catch (error) {
            console.error(`Error deleting category ${categoryId}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to delete category' 
            };
        }
    }

    // Toggle featured status (Admin only)
    async toggleFeatured(categoryId) {
        try {
            console.log(`Toggling featured status for category: ${categoryId}`);
            
            const response = await api.patch(`/categories/${categoryId}/toggle-featured`);
            
            console.log('Featured status toggled:', response);
            return response;
        } catch (error) {
            console.error(`Error toggling featured status for category ${categoryId}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to toggle featured status' 
            };
        }
    }

    // Toggle active status (Admin only)
    async toggleActive(categoryId) {
        try {
            console.log(`Toggling active status for category: ${categoryId}`);
            
            const response = await api.patch(`/categories/${categoryId}/toggle-active`);
            
            console.log('Active status toggled:', response);
            return response;
        } catch (error) {
            console.error(`Error toggling active status for category ${categoryId}:`, error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to toggle active status' 
            };
        }
    }

    // Update product counts (Admin only)
    async updateProductCounts() {
        try {
            console.log('Updating product counts for all categories');
            
            const response = await api.post('/categories/update-counts');
            
            console.log('Product counts updated:', response);
            return response;
        } catch (error) {
            console.error('Error updating product counts:', error);
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to update product counts' 
            };
        }
    }

    // Helper methods for formatting and utility

    // Format category slug for URLs
    formatSlug(categoryName) {
        return categoryName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Get category icon based on name or metadata
    getCategoryIcon(category) {
        if (category.metaData?.icon) {
            return category.metaData.icon;
        }

        // Default icons based on category name
        const name = category.name.toLowerCase();
        if (name.includes('electronics') || name.includes('tech')) return 'laptop';
        if (name.includes('fashion') || name.includes('clothing')) return 'shirt';
        if (name.includes('home') || name.includes('kitchen')) return 'home';
        if (name.includes('sports') || name.includes('fitness')) return 'dumbbell';
        if (name.includes('books') || name.includes('media')) return 'book';
        if (name.includes('beauty') || name.includes('care')) return 'heart';
        if (name.includes('automotive') || name.includes('car')) return 'car';
        if (name.includes('toys') || name.includes('games')) return 'puzzle';
        
        return 'category'; // Default icon
    }

    // Get category color
    getCategoryColor(category) {
        return category.metaData?.color || '#3B82F6';
    }

    // Build breadcrumb from category hierarchy
    buildBreadcrumbs(category) {
        if (!category.hierarchy) {
            return [{ name: category.name, slug: category.slug }];
        }

        return category.hierarchy.map(item => ({
            name: item.name,
            slug: item.slug
        }));
    }

    // Filter categories by search term
    searchCategories(categories, searchTerm) {
        if (!searchTerm) return categories;

        const term = searchTerm.toLowerCase();
        return categories.filter(category => 
            category.name.toLowerCase().includes(term) ||
            category.description?.toLowerCase().includes(term) ||
            category.keywords?.some(keyword => 
                keyword.toLowerCase().includes(term)
            )
        );
    }

    // Sort categories
    sortCategories(categories, sortBy = 'sortOrder') {
        return [...categories].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'productCount':
                    return (b.productCount || 0) - (a.productCount || 0);
                case 'level':
                    return a.level - b.level;
                case 'sortOrder':
                default:
                    return (a.sortOrder || 0) - (b.sortOrder || 0);
            }
        });
    }

    // Get category path as string
    getCategoryPath(category) {
        if (!category.hierarchy) {
            return category.name;
        }

        return category.hierarchy
            .map(item => item.name)
            .join(' > ');
    }
}

const categoryService = new CategoryService();
export default categoryService;
