# Bulk Upload Sample Files

This directory contains sample JSON files for testing the bulk product upload feature.

## Files

### `product-upload-template.json`
A valid template with 3 example products that can be uploaded successfully. Use this as a reference for the correct JSON structure.

**Product categories included:**
- Google Pixel 9 Pro (mobile-phones/android)
- OnePlus 12 (mobile-phones/android)
- Anker PowerCore 20000 (accessories/chargers)

### `sample-with-errors.json`
A test file containing 5 products, where 1 is valid and 4 have different validation errors. Use this to test error handling and validation feedback.

**Errors included:**
- Product #2: Missing required field `name`
- Product #3: Invalid category `invalid-category`
- Product #4: Invalid price `-100` (must be positive)
- Product #5: Invalid rating `10` (must be 0-5)

## JSON Structure

```json
{
  "products": [
    {
      "name": "Product Name",           // Required
      "brand": "Brand Name",            // Required
      "category": "category-slug",      // Required - must exist in database
      "subcategory": "subcategory-slug",// Optional - must exist in category
      "price": 999,                     // Required - positive number
      "originalPrice": 1099,            // Optional - for showing discounts
      "image": "https://...",           // Optional - product image URL
      "specs": ["Spec 1", "Spec 2"],    // Optional - quick specs array
      "detailedSpecs": {                // Optional - detailed specs object
        "Display": "6.7 inch",
        "Processor": "Chip name"
      },
      "rating": 4.5,                    // Optional - 0 to 5
      "inStock": true,                  // Optional - default true
      "featured": false                 // Optional - default false
    }
  ]
}
```

## Field Validation Rules

### Required Fields
- `name`: Product name (string)
- `brand`: Brand name (string)
- `category`: Category slug (must exist in categories table)
- `price`: Product price (positive number)

### Optional Fields
- `subcategory`: Subcategory slug (must exist within the specified category)
- `originalPrice`: Original price for showing discounts (defaults to price)
- `image`: Product image URL (defaults to empty string)
- `specs`: Array of quick spec strings (defaults to empty array)
- `detailedSpecs`: Object with detailed specifications (defaults to empty object)
- `rating`: Product rating from 0 to 5 (defaults to 0)
- `inStock`: Boolean availability (defaults to true)
- `featured`: Boolean featured status (defaults to false)

## Limits

- **Max file size**: 5MB
- **Max products per upload**: 1000

## How to Use

1. Navigate to Admin Dashboard → Bulk Upload
2. Download one of these templates or create your own following the structure
3. Edit the JSON file with your product data
4. Upload via drag & drop or file browser
5. Review the results and error report (if any)

## Testing Tips

1. **Test valid upload**: Use `product-upload-template.json` to verify successful upload
2. **Test validation**: Use `sample-with-errors.json` to see error handling
3. **Test category validation**: Create a product with a non-existent category
4. **Test subcategory validation**: Use a subcategory that doesn't exist in the selected category
5. **Test file size limit**: Try uploading a file larger than 5MB
6. **Test batch limit**: Try uploading more than 1000 products

## Error Messages

Common validation errors you might encounter:

- `name is required` - Product is missing the name field
- `brand is required` - Product is missing the brand field
- `category is required` - Product is missing the category field
- `price is required` - Product is missing the price field
- `category "xyz" does not exist` - The specified category slug doesn't exist
- `subcategory "xyz" does not exist in category "abc"` - Invalid subcategory for the category
- `price must be a positive number` - Price is 0, negative, or not a number
- `rating must be between 0 and 5` - Rating is outside the valid range
- `Too many products. Maximum 1000 per upload` - Exceeded batch limit
- `Invalid JSON format` - JSON parsing error (syntax error in file)
