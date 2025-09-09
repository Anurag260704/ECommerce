import React from 'react';
import { Plus, Save, Trash2, Edit3, Download, Heart } from 'lucide-react';

const ButtonShowcase = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Components Showcase</h1>
        <p className="text-gray-600 mb-8">
          All button styles with proper padding, spacing, and consistent design.
        </p>

        {/* Primary Buttons */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" />
              Small Primary
            </button>
            <button className="btn btn-primary">
              <Save className="h-4 w-4" />
              Default Primary
            </button>
            <button className="btn btn-primary btn-lg">
              <Download className="h-4 w-4" />
              Large Primary
            </button>
            <button className="btn btn-primary" disabled>
              <Heart className="h-4 w-4" />
              Disabled
            </button>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="btn btn-secondary btn-sm">
              <Edit3 className="h-4 w-4" />
              Small Secondary
            </button>
            <button className="btn btn-secondary">
              <Edit3 className="h-4 w-4" />
              Default Secondary
            </button>
            <button className="btn btn-secondary btn-lg">
              <Edit3 className="h-4 w-4" />
              Large Secondary
            </button>
          </div>
        </section>

        {/* Outline Buttons */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Outline Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="btn btn-outline btn-sm">
              <Plus className="h-4 w-4" />
              Small Outline
            </button>
            <button className="btn btn-outline-primary">
              <Save className="h-4 w-4" />
              Primary Outline
            </button>
            <button className="btn btn-outline-secondary">
              <Edit3 className="h-4 w-4" />
              Secondary Outline
            </button>
            <button className="btn btn-outline-error">
              <Trash2 className="h-4 w-4" />
              Error Outline
            </button>
          </div>
        </section>

        {/* Error Buttons */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error/Danger Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="btn btn-error btn-sm">
              <Trash2 className="h-4 w-4" />
              Delete Small
            </button>
            <button className="btn btn-error">
              <Trash2 className="h-4 w-4" />
              Delete Default
            </button>
            <button className="btn btn-outline-error">
              <Trash2 className="h-4 w-4" />
              Delete Outline
            </button>
          </div>
        </section>

        {/* Ghost Buttons */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ghost Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="btn btn-ghost btn-sm">
              <Edit3 className="h-4 w-4" />
              Small Ghost
            </button>
            <button className="btn btn-ghost">
              <Edit3 className="h-4 w-4" />
              Default Ghost
            </button>
            <button className="btn btn-ghost btn-lg">
              <Edit3 className="h-4 w-4" />
              Large Ghost
            </button>
          </div>
        </section>

        {/* Button Groups */}
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Button Groups</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="btn btn-primary">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button className="btn btn-outline">
                Cancel
              </button>
            </div>
            
            <div className="flex gap-2">
              <button className="btn btn-outline-primary btn-sm">
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button className="btn btn-outline-error btn-sm">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Usage Notes */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Usage Guidelines</h2>
          <ul className="text-blue-800 space-y-2">
            <li>• All buttons now have consistent padding and minimum height</li>
            <li>• Icons and text are automatically spaced with gap-2</li>
            <li>• Focus rings use the primary color theme</li>
            <li>• No need for additional "inline-flex items-center gap-2" classes</li>
            <li>• Use btn-sm, default, or btn-lg for size variations</li>
            <li>• Disabled states are automatically handled</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ButtonShowcase;
