const {PythonShell} = require('python-shell');

let current_folder = "./html";
    
    /*return `drwxrwxr-x    2 3232     2768         4096 Nov 10  2018 ..
-rw-rw-r--    1 3232     2768        40496 May 04 07:22 RERCI-release-img.png
-rw-rw-r--    1 3232     2768         6341 May 05 13:55 about_rerci.html
-rw-rw-r--    1 3232     2768         4718 May 04 07:22 aims_and_scope.html
-rw-rw-r--    1 3232     2768        19449 Jul 05 18:48 annual_congress.html
drwxrwxr-x    2 3232     2768         4096 Nov 09  2018 backup-20181109074409
-rw-rw-r--    1 3232     2768         9763 Dec 21  2018 clamp.js
drwxrwxr-x    2 3232     2768         4096 Nov 14  2018 congress
drwxrwxr-x   20 3232     2768         4096 Jun 25 15:20 congress_documents
-rw-rw-r--    1 3232     2768        10264 May 04 07:22 congress_documents.php
-rw-rw-r--    1 3232     2768        38940 May 04 07:22 congress_documents_array.php
-rw-rw-r--    1 3232     2768       290138 May 04 07:22 copyright_dictionary.jpg
-rw-rw-r--    1 3232     2768        65065 May 04 07:22 copyright_img.jpg
-rw-rw-r--    1 3232     2768          358 May 04 07:22 dot.png
drwxrwxr-x    2 3232     2768         4096 Nov 10  2018 editor_pictures
-rw-rw-r--    1 3232     2768        16220 May 04 07:22 editorial_board.html
drwxrwxr-x    2 3232     2768         4096 Nov 10  2018 email_data`;*/



function get_list_of_content_objects(list_of_lines) {
    /* Takes a list of lines output by the python script folder_browser.py and returns a list with file 
       objects corresponding to the files and folders in the folder. Always adds an extra "back" folder 
       at the top */
    
    let result_list = [{type: 'folder', name: '..', is_editable: false}]
    
    for (let i = 0; i < list_of_lines.length; i++) {
        let list_of_fields = list_of_lines[i].split(' ');
        let name_str = list_of_fields[list_of_fields.length-1];
        
        //if this entry in the list refers to a directory
        if (list_of_lines[i][0] === "d") {
            result_list.push({type: 'folder', name: name_str, is_editable: false});
            
        } else {
            result_list.push({type: 'file', name: name_str, is_editable: true});
        }
    }

    return result_list;
}



function change_folder(str) {
    /* Takes a folder as a string (e.g my_folder), and populates the page with the contents of that folder */
    
    //Addresses special case where the folder is the back folder
    if (str === "..") {
        //don't do anything if we are at asking to go back from the root folder
        if (current_folder !== ".") {
            let folder_tree = current_folder.split("/");
            current_folder = folder_tree.slice(0, folder_tree.length - 1).join("/");
        }
    } else {
        current_folder += "/" + str;
    }
    
    title_h1_tag = document.getElementById('folder-title');
    title_h1_tag.textContent = "Loading..."; //give the user some feedback on what is going on
    populate_page(current_folder);
}



async function populate_page(str) {
    /* Takes a directory string to open. Queries the python script to get the contents of the directory, 
       and then prints those contents to the page. */
    
    let options = {
        scriptPath : './python_scripts/',
        args : [str]
    }

    PythonShell.run('folder_browser.py', options, (error, output) => {console.log(error);print_folder_contents(output, str)});
}



function print_folder_contents (python_output_list, directory_address) {
    /* Prints the contents of the given folder contents list to the browser window. Note that an example entry 
       of the folder_contents_list is:
       -rw-rw-r--    1 3232     2768        40496 May 04 07:22 RERCI-release-img.png */
    
    folder_contents_list = get_list_of_content_objects(python_output_list)
    title_h1_tag = document.getElementById('folder-title');
    container_div = document.getElementById('directory-container');
    
    let inner_html = '';
    for (let i = 0; i < folder_contents_list.length; i ++) {
        console.log(folder_contents_list[i])
        let content_type = folder_contents_list[i].type.split(',')[0];
        
        if (content_type === 'file') {
            inner_html += `<div class="file-line"><p class="body-text">${folder_contents_list[i].name}</p><a class="edit-button" href="./edit_html_file.html">EDIT</a><button class="trash-button">DELETE</button></div>`;
            
        } else if (content_type === 'folder') {
            inner_html += `<div class="folder-line" onclick="change_folder('${folder_contents_list[i].name}')"><p class="body-text">${folder_contents_list[i].name}</p></div>`;
        } 
    }
    
    let folder_name = directory_address.split('/').pop();
    title_h1_tag.textContent = folder_name;
    container_div.innerHTML = inner_html;
}


//Initial populate
populate_page(current_folder);