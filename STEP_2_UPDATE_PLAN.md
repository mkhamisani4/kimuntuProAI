# Step 2 Update Plan

## Fields to Update:
1. shortDescription - change checkbox to "Generate with AI" button
2. aboutUs - change checkbox to "Generate with AI" button
3. industry - change checkbox to "Generate with AI" button
4. keyServices - change checkbox to "Generate with AI" button

## Pattern to Use:
```tsx
{hasPlanAttached && (
  <button
    type="button"
    onClick={() => updateData({ FIELD: data.FIELD === 'ai_fill' ? '' : 'ai_fill' })}
    className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
      data.FIELD === 'ai_fill'
        ? 'border-purple-500 bg-purple-500/10'
        : 'border-gray-700 bg-white/5 hover:border-gray-600'
    }`}
  >
    <div className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-purple-400" />
      <div className="flex-1 text-left">
        <div className="font-semibold text-white">Generate with AI</div>
        <div className="text-sm text-gray-400">Let AI create this from your business plan</div>
      </div>
    </div>
  </button>
)}
```
