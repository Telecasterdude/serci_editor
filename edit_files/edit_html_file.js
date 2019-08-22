let current_number_of_lines = 1;

function keypress_handler(key) {
    /* Takes a key and changes the display of the text editor as nessesary */
    
    let line_numbers = document.querySelector("#line-numbers");
    let code = document.querySelector('#code-area'); 
    let selection = window.getSelection();
    
    if (key == "Enter") {
        current_number_of_lines++;
        line_numbers.innerHTML += `<br>${current_number_of_lines}`;
        
    /* Don't remove lines if we are just backspacing characters or we are trying remove the last line*/    
    } else if (key == "Backspace" && selection.anchorNode.innerHTML === "<br>" && current_number_of_lines > 1) {
        line_number_str = line_numbers.innerHTML;
        line_number_list = line_number_str.split("<br>");
        line_number_list = line_number_list.slice(0,-1);
        line_numbers.innerHTML = line_number_list.join("<br>")
        current_number_of_lines--;
    }
}



let code_area = document.querySelector('#code-area');
document.querySelector('#code-area').addEventListener('keydown', (e) => keypress_handler(e.key));
document.querySelector('#code-area').addEventListener('paste', (e) => {
    paste_str = e.clipboardData.getData('text/plain');
    /* Handle each character in the paste as if it was typed in */
    for (let i = 0; i < paste_str.length; i++) {
        if (paste_str[i] === "\n") {
            keypress_handler("Enter");
        } else {
            keypress_handler(paste_str[i]);
        }
    }
});

