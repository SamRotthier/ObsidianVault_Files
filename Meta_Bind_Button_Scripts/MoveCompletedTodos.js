const fs = require('fs');

/*
Example button:
```meta-bind-button
label: Move Done Tasks's
icon: ""
style: primary
class: ""
cssStyle: ""
backgroundImage: ""
tooltip: ""
id: ""
hidden: false
action:
  type: js
  file: Various/7_Scripts/MoveCompletedTodos.js
  args:
    sourceFile: "D:\\Sam_Repo_Notes\\Untitled_2.md"
    destinationFile: "D:\\Sam_Repo_Notes\\Untitled_1.md"
    taskIsRepeating: false
```
    sourceFile: "D:\\Sam_Repo_Notes\\Untitled_2.md"
    destinationFile: "D:\\Sam_Repo_Notes\\Untitled_1.md"
*/
console.log("Context Args:", context.args);

// Configuration of the script
const btnConfig = {
  sourceFile: context.args.sourceFile,
  destinationFile: context.args.destinationFile,
  taskIsRepeating: context.args.taskIsRepeating ?? false,
  regexPattern: /\[x\]/i  // Matches "[x]"
}

function moveCompletedTodos(){
  try {
    // Get the source file paths
    const sourceFilePath = btnConfig.sourceFile;
    const destinationFilePath = btnConfig.destinationFile;

    let sourceContent = '';
    let destinationContent = '';

    // Read contents of source file
    if (fs.existsSync(sourceFilePath)) {
      sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
    } else {
      console.error(`Source file or path ${sourceFilePath} does not exist.`);
      return;
    }

    // Reads the contents of the destination file
    if (fs.existsSync(destinationFilePath)) {
      destinationContent = fs.readFileSync(destinationFilePath, 'utf8');
    } 

    const lines = sourceContent.split('\n'); // Split the file content into different lines
    const remainingLines = [];
    const completedTodos = [];

    // Loops trough each line and checks if it is a done todo
    lines.forEach(line => {
      if (btnConfig.regexPattern.test(line)) {
        completedTodos.push(line);

        // Repeating tasks get unchecked and archived
        if (btnConfig.taskIsRepeating) {
          const uncheckTodo = line.replace(/\[x\]/i , '[ ]')
          remainingLines.push(uncheckTodo);
        }
      } else {
        remainingLines.push(line);
      }
    });

    // Updating the source file with remaining lines
    fs.writeFileSync(sourceFilePath, remainingLines.join('\n'));

    if (completedTodos.length > 0) {
      let content = destinationContent.trim();
      const today = new Date().toISOString().split('T')[0]; // gets today yyyy-mm-dd
      const movedOnRegex = /## Moved on (\d{4}-\d{2}-\d{2})/g;
      let lastDate = null;
      for (const match of content.matchAll(movedOnRegex)) {
        if (!lastDate || match[1] > lastDate) {
          lastDate = match[1]; // Store the latest date found
        }
      }
      if (lastDate !== today) {
        // If the last recorded date is different from today, add a new section
        content += `\n\n## Moved on ${today}\n\n`;
      }
      
      content += (content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n');
      content += completedTodos.join('\n');
      content += '\n';

      fs.writeFileSync(destinationFilePath, content); // This also makes the file if it wasn't made yet
      console.log(`Moved ${completedTodos.length} completed todos to ${btnConfig.destinationFile}`);
      console.log(completedTodos)
    }
  } catch (error) {
    console.error('Error moving todos:', error);
  }
}

moveCompletedTodos()