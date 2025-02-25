# Google Forms Generator

This tool allows you to automatically generate Google Forms based on a set of images and content. It provides three main methods to create forms:

1. From a JSON data structure
2. From a folder of images
3. From a spreadsheet (CSV or Google Sheets)

## Setup Instructions

### 1. Create a Google Apps Script Project

1. Go to [script.google.com](https://script.google.com/)
2. Click "New Project"
3. Delete any existing code in the editor
4. Copy and paste the content of `FormGenerator.gs` into the editor
5. Click File > Save and name your project (e.g., "Google Forms Generator")

### 2. Grant Necessary Permissions

The first time you run any function, you'll be prompted to grant the script permissions to:
- Create and modify Google Forms
- Access your Google Drive to read files and images
- Make HTTP requests (for accessing image URLs)

## Usage Methods

### Method 1: Generate a Form from a Spreadsheet

This is the easiest approach for non-technical users:

1. Create a Google Sheet with the same format as the `template-spreadsheet.csv` included in this repository
2. Fill in your form content, including:
   - Form title and description (rows 1-2)
   - Questions with types, titles, required settings, etc. (rows 3+)
   - Image URLs if needed
3. In the script editor, run the function `createFormFromSpreadsheet()`
   - You'll need to provide your spreadsheet ID (found in the URL of your Google Sheet)
   - Optionally specify the sheet name if not using the first sheet

### Method 2: Generate a Form from a Folder of Images

If you want to create a form where each question is based on an image:

1. Create a Google Drive folder and upload your images
2. In the script editor, run the function `createFormFromImageFolder()`
   - Provide the folder ID (found in the URL when viewing the folder)
   - Specify a form title
   - Create a question template (e.g., "What do you think about {filename}?")

### Method 3: Generate a Form Programmatically

For more advanced customization, you can directly call `createFormFromData()` with a JSON structure:

```javascript
var formData = {
  title: "My Form Title",
  description: "Form description here",
  collectEmail: true,
  questions: [
    {
      type: "text",
      title: "Question 1",
      required: true
    },
    {
      imageUrl: "https://example.com/image.jpg",
      type: "multiple_choice",
      title: "Question with image",
      choices: ["Option 1", "Option 2", "Option 3"]
    }
    // Add more questions here
  ]
};

createFormFromData(formData);
```

## Available Question Types

The script supports all standard Google Forms question types:

- `text` - Short answer text
- `paragraph` - Paragraph text
- `multiple_choice` - Multiple choice (radio buttons)
- `checkbox` - Checkboxes (select multiple)
- `dropdown` - Dropdown selection
- `scale` - Linear scale
- `grid` - Multiple choice grid
- `date` - Date picker
- `time` - Time picker

## Working with Images

Images can be added to questions in several ways:

1. **Direct URLs**: Provide a public image URL in the spreadsheet or JSON structure
2. **Google Drive**: Images in a Drive folder (for the `createFormFromImageFolder()` method)
3. **Uploaded Images**: If you have image files, upload them to Drive first, then use their URLs

## Example Workflow with a Drive Folder of Images

1. Upload all your product images to a Google Drive folder
2. Note the folder ID from the URL
3. In the script editor, run:

```javascript
createFormFromImageFolder(
  "YOUR_FOLDER_ID_HERE", 
  "Product Feedback Survey", 
  "What do you think about {filename}?"
);
```

4. The script will generate a form with each image followed by a feedback question

## Example Workflow with a Spreadsheet

1. Create a copy of the template spreadsheet
2. Fill in your form details and questions
3. In the script editor, run:

```javascript
createFormFromSpreadsheet("YOUR_SPREADSHEET_ID_HERE");
```

4. The script will create a form based on your spreadsheet data

## Best Practices

- Host images on a reliable platform with public access (Google Drive works well)
- For large forms, consider breaking them into sections
- Use clear, descriptive filenames for your images as they may be used in question titles
- Test your form after generation to ensure all images load correctly

## Limitations

- Google Forms has certain limits on the number of questions per form
- Image loading is dependent on the availability of the image URLs
- The script requires appropriate permissions to access Drive files and create forms

## Troubleshooting

- If images don't appear, check that they have public sharing enabled
- If the script fails, check the Execution log in the Apps Script editor
- For large forms with many images, the script may take some time to run

## Need Help?

If you need assistance with this tool, please open an issue in this repository.
