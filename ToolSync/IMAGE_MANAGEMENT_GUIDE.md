# Tool Image Management Guide

## Quick Summary
- ✅ **Images stored as files** in `storage/app/public/images/tools/`
- ✅ **Paths stored in database** (e.g., `images/tools/printer.png`)
- ✅ **Accessed via symlink** at `public/storage/`

## How to Add Images to Tools

### Method 1: Manual (Current Method)

#### Step 1: Copy image file
```bash
# Copy your image to:
storage/app/public/images/tools/my-tool.png
```

#### Step 2: Update database
Run SQL or use the PHP scripts:
```sql
UPDATE tools 
SET image_path = 'images/tools/my-tool.png' 
WHERE id = 1;
```

Or use the provided scripts:
- `php add_tool_with_image.php` (create new tool)
- `php update_tool_image.php` (update existing tool)

### Method 2: Through Admin Panel (Not Built Yet)

**Would you like me to add image upload functionality to your admin panel?**
This would allow you to:
- Upload images directly from the browser
- Automatically save to the correct folder
- Update the database automatically
- Preview images before saving

## Important Notes

1. **Storage Link Required**
   ```bash
   php artisan storage:link
   ```
   This creates a symlink from `public/storage` → `storage/app/public`

2. **Supported Image Formats**
   - PNG (recommended for tools with transparency)
   - JPG/JPEG (recommended for photos)
   - WebP (modern, smaller file size)

3. **Recommended Image Size**
   - Width: 800-1200px
   - Aspect Ratio: 4:3 (matches the card design)
   - File Size: < 500KB

4. **File Naming Convention**
   - Use lowercase
   - Use hyphens for spaces
   - Examples: `laptop-dell-xps.png`, `projector-epson.jpg`

## Folder Structure
```
storage/
└── app/
    └── public/         ← Accessible via web
        └── images/
            └── tools/   ← Put tool images here
                ├── printer.png
                ├── laptop.png
                └── camera.png

public/
└── storage/            ← Symlink created by 'storage:link'
    └── images/
        └── tools/       ← Same files accessible here
```

## Troubleshooting

### Images not showing?
1. Check storage link exists: `php artisan storage:link`
2. Verify file exists: `storage/app/public/images/tools/[filename]`
3. Check file permissions (should be readable)
4. Clear browser cache (Ctrl + F5)

### Where does the database store paths?
```sql
SELECT id, name, image_path FROM tools;
```

The `image_path` column stores paths like:
- `images/tools/printer.png` ✅ Correct
- NOT `http://...` ❌ Wrong
- NOT full file system path ❌ Wrong
