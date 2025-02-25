/**
 * Google Forms Generator
 * This script automatically generates Google Forms based on images and content
 */

/**
 * Main function to create a form from a structured data object
 * @param {Object} formData - Object containing form configuration
 * @return {FormApp.Form} The created form
 */
function createFormFromData(formData) {
  // Create a new form
  var form = FormApp.create(formData.title);
  
  // Set form description
  if (formData.description) {
    form.setDescription(formData.description);
  }
  
  // Set form settings
  form.setAllowResponseEdits(formData.allowResponseEdits || false)
    .setCollectEmail(formData.collectEmail || true)
    .setLimitOneResponsePerUser(formData.limitOneResponsePerUser || false);
  
  // Add questions
  if (formData.questions && formData.questions.length > 0) {
    formData.questions.forEach(function(questionData) {
      addQuestionToForm(form, questionData);
    });
  }
  
  // Return the form URL
  Logger.log('Form created: ' + form.getPublishedUrl());
  return form;
}

/**
 * Adds a question to the form based on question data
 * @param {FormApp.Form} form - The form to add questions to
 * @param {Object} questionData - Data for the question
 */
function addQuestionToForm(form, questionData) {
  var question;
  
  // Handle image if included
  if (questionData.imageUrl) {
    var image = UrlFetchApp.fetch(questionData.imageUrl);
    
    // Add image item before the question
    form.addImageItem()
      .setImage(image)
      .setTitle(questionData.imageTitle || '');
  }
  
  // Create the appropriate question type
  switch (questionData.type) {
    case 'text':
      question = form.addTextItem();
      break;
      
    case 'paragraph':
      question = form.addParagraphTextItem();
      break;
      
    case 'multiple_choice':
      question = form.addMultipleChoiceItem();
      if (questionData.choices && questionData.choices.length > 0) {
        question.setChoiceValues(questionData.choices);
      }
      break;
      
    case 'checkbox':
      question = form.addCheckboxItem();
      if (questionData.choices && questionData.choices.length > 0) {
        question.setChoiceValues(questionData.choices);
      }
      break;
      
    case 'dropdown':
      question = form.addListItem();
      if (questionData.choices && questionData.choices.length > 0) {
        question.setChoiceValues(questionData.choices);
      }
      break;
      
    case 'scale':
      question = form.addScaleItem();
      question.setBounds(questionData.min || 1, questionData.max || 5);
      if (questionData.labels) {
        question.setLabels(questionData.labels.low || '', questionData.labels.high || '');
      }
      break;
      
    case 'grid':
      question = form.addGridItem();
      if (questionData.rows && questionData.rows.length > 0) {
        question.setRows(questionData.rows);
      }
      if (questionData.columns && questionData.columns.length > 0) {
        question.setColumns(questionData.columns);
      }
      break;
      
    case 'date':
      question = form.addDateItem();
      break;
      
    case 'time':
      question = form.addTimeItem();
      break;
      
    default:
      question = form.addTextItem();
  }
  
  // Set common properties
  question.setTitle(questionData.title || 'Question');
  
  if (questionData.helpText) {
    question.setHelpText(questionData.helpText);
  }
  
  if (questionData.required) {
    question.setRequired(true);
  }
  
  return question;
}

/**
 * Example function that demonstrates how to use the form generator
 * with a JSON input structure
 */
function createExampleForm() {
  var exampleData = {
    title: "Product Feedback Survey",
    description: "Please provide your feedback on our new product",
    collectEmail: true,
    questions: [
      {
        type: "text",
        title: "What is your name?",
        required: true
      },
      {
        type: "paragraph",
        title: "Please share your initial impressions of the product",
        helpText: "Be as detailed as possible"
      },
      {
        imageUrl: "https://example.com/product-image.jpg",
        imageTitle: "Product Image",
        type: "multiple_choice",
        title: "How would you rate the design of this product?",
        choices: ["Excellent", "Good", "Average", "Below Average", "Poor"],
        required: true
      },
      {
        type: "checkbox",
        title: "Which features did you find most useful?",
        choices: ["Feature A", "Feature B", "Feature C", "Feature D", "Other"],
      },
      {
        type: "scale",
        title: "How likely are you to recommend this product to others?",
        min: 1,
        max: 10,
        labels: {
          low: "Not likely",
          high: "Very likely"
        },
        required: true
      }
    ]
  };
  
  return createFormFromData(exampleData);
}

/**
 * Creates a form based on a folder of images
 * @param {String} folderId - Drive folder ID containing images
 * @param {String} formTitle - Title for the new form
 * @param {String} questionTemplate - Template text for questions (use {filename} as placeholder)
 */
function createFormFromImageFolder(folderId, formTitle, questionTemplate) {
  // Create form data structure
  var formData = {
    title: formTitle || "Image-based Form",
    description: "This form was automatically generated from images",
    collectEmail: true,
    questions: []
  };
  
  // Get all files from the folder
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  
  // Add each image to the form
  while (files.hasNext()) {
    var file = files.next();
    
    // Check if it's an image
    if (file.getMimeType().indexOf('image/') === 0) {
      // Create a publicly accessible URL for the image
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Format question title from template
      var questionTitle = questionTemplate.replace("{filename}", file.getName());
      
      // Add to questions array
      formData.questions.push({
        imageUrl: file.getDownloadUrl(),
        imageTitle: file.getName(),
        type: "paragraph",
        title: questionTitle,
        required: true
      });
    }
  }
  
  // Create the form
  return createFormFromData(formData);
}

/**
 * Creates a form with questions based on a spreadsheet
 * @param {String} spreadsheetId - ID of spreadsheet containing content
 * @param {String} sheetName - Name of sheet with content
 */
function createFormFromSpreadsheet(spreadsheetId, sheetName) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName || "Form Content");
  var data = sheet.getDataRange().getValues();
  
  // Assume first row is headers
  var headers = data[0];
  
  // Create form with title from cell A1
  var formData = {
    title: data[1][0] || "Generated Form",
    description: data[1][1] || "",
    collectEmail: true,
    questions: []
  };
  
  // Start from row 3 (index 2) for questions
  for (var i = 2; i < data.length; i++) {
    var row = data[i];
    
    // Skip empty rows
    if (!row[0]) continue;
    
    var questionData = {
      type: row[0],
      title: row[1],
      required: row[2] === "TRUE" || row[2] === true
    };
    
    // Add help text if present
    if (row[3]) {
      questionData.helpText = row[3];
    }
    
    // Add image if URL is present
    if (row[4]) {
      questionData.imageUrl = row[4];
      if (row[5]) {
        questionData.imageTitle = row[5];
      }
    }
    
    // Add choices for question types that need them
    if (["multiple_choice", "checkbox", "dropdown"].indexOf(questionData.type) >= 0) {
      if (row[6]) {
        // Parse choices from comma-separated list
        questionData.choices = row[6].split(",").map(function(choice) {
          return choice.trim();
        });
      }
    }
    
    // Add scale bounds if needed
    if (questionData.type === "scale") {
      questionData.min = parseInt(row[6]) || 1;
      questionData.max = parseInt(row[7]) || 5;
      
      if (row[8] || row[9]) {
        questionData.labels = {
          low: row[8] || "",
          high: row[9] || ""
        };
      }
    }
    
    // Add grid rows/columns if needed
    if (questionData.type === "grid") {
      if (row[6]) {
        questionData.rows = row[6].split(",").map(function(row) {
          return row.trim();
        });
      }
      if (row[7]) {
        questionData.columns = row[7].split(",").map(function(column) {
          return column.trim();
        });
      }
    }
    
    formData.questions.push(questionData);
  }
  
  return createFormFromData(formData);
}
