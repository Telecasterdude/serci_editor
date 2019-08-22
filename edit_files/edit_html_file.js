let edit_state = {current_number_of_lines : 1, 
                  is_pasting_data : false}; 

function change_line_numbers(numlines_to_add) {
    /* Takes an integer specifying the number of lines to add. If this number 
     * is negative then change_line_numbers will remove lines instead */
    
    let line_numbers = document.querySelector("#line-numbers");
    
    if (numlines_to_add >= 0) {
        for (let i = 0; i < numlines_to_add; i++) {
            edit_state.current_number_of_lines++;
            line_numbers.innerHTML += `<br>${edit_state.current_number_of_lines}`;
        }
    } else if (numlines_to_add < 0) {
        //remember numlines_to_add is < 0 here
        edit_state.current_number_of_lines += numlines_to_add;
        line_number_str = line_numbers.innerHTML;
        line_number_list = line_number_str.split("<br>");
        line_number_list = line_number_list.slice(0, numlines_to_add);
        line_numbers.innerHTML = line_number_list.join("<br>")
    }
}


function keypress_handler(key) {
    /* Takes a key and changes the display of the text editor as nessesary */
    
    let line_numbers = document.querySelector("#line-numbers");
    let code = document.querySelector('#code-area'); 
    let selection = window.getSelection();

    
    if (key === "Enter") {
        change_line_numbers(1);
    
     /* The user has highlighted some text and pressed backspace */
    } else if (key === "Backspace" && selection.toString().length > 0) {  /* this needs to come before normal backspace */
        let selected_text = selection.toString();                         /* or else there is a bug when selecting blank enters */
        let number_of_enters = selected_text.match(/\n/g).length;
        change_line_numbers(-number_of_enters); /* Remove a line for each enter we found */
        
    /* Don't remove lines if we are just backspacing characters or we are trying remove the last line */
    // see https://stackoverflow.com/questions/27241281/what-is-anchornode-basenode-extentnode-and-focusnode-in-the-object-returned
    // to understand why we use anchorOffset
    } else if (key === "Backspace" && selection.anchorOffset === 0 && edit_state.current_number_of_lines > 1) {
        change_line_numbers(-1);
    }  
    
    
    //this is a temprorary fix for an obscure bug
    if (!(key === "Backspace" && selection.toString().length > 0)) {
        let required_num_lines = Math.max((code.innerHTML.match(/<\/div>|^\s<div>|<br>^<\/div>/g) || []).length, 1) - (key === "Backspace") * 1;
        if (edit_state.current_number_of_lines < required_num_lines) {
            line_numbers.innerHTML = `${1}`;
            for (let i = 1; i < required_num_lines; i++) {
                line_numbers.innerHTML += `<br>${i+1}`;
            }
            edit_state.current_number_of_lines = required_num_lines;
        }
    }
}



let code_area = document.querySelector('#code-area');
document.querySelector('#code-area').addEventListener('keydown', (e) => keypress_handler(e.key));
document.querySelector('#code-area').addEventListener('paste', (e) => {
    paste_str = e.clipboardData.getData('text/plain');
    let number_of_enters = (paste_str.match(/\n/g) || []).length; //need || incase something with no \n is pasted
    
    //for some reason the last enter is not recognised by the browser
    if (paste_str[paste_str.length-1] === "\n") {
        number_of_enters--;
    }
    change_line_numbers(number_of_enters);
});

