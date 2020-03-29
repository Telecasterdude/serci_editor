const {dialog} = require('electron').remote;
const {PythonShell} = require('python-shell');

let current_folder = "";
    
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


function open_upload_file_dialog() {
    /* When clicked allows users to select files and then sends them to the python script for uploading */
    
    list_of_selected_files = dialog.showOpenDialog();
    if (list_of_selected_files !== undefined && list_of_selected_files.length == 1) {
        upload_file_to_server(list_of_selected_files[0]);
    }
}



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
        if (current_folder !== "") {
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
    
    let new_file_link = document.querySelector("#new-file-link");
    new_file_link.setAttribute('href', `./edit_html_file.html?filename=${str}/click_here_to_edit_filename&is_new_file=true`)
    
    let options = {
        scriptPath : './python_scripts/',
        args : [str]
    }

    PythonShell.run('folder_browser.py', options, (error, output) => {console.log(error);print_folder_contents(output, str)});
}


async function upload_file_to_server(filepath_on_pc) {
    filename = filepath_on_pc.split("/")[filepath_on_pc.split("/").length - 1]
    filepath_on_server = current_folder.slice(1) !== "" ? current_folder.slice(1) + "/" + filename : filename
    
    
    let options = {
        scriptPath : './python_scripts/',
        args : [2, filepath_on_server, filepath_on_pc, "This file was added from within the EDIT APP"]
    }
    
    PythonShell.run('upload_download_file.py', options, (error, output) => {console.log(error);if (output === undefined) {alert("An error has occured. File upload unsuccessful.");} else {alert(output); populate_page(current_folder);}});
    
}

function delete_file(e, filename) {
    filepath = current_folder !== "" ? current_folder + "/" + filename : filename;
    console.log(filepath);
    e.preventDefault(); //stop event from bubbling
    
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
        let options = {
            scriptPath : './python_scripts/',
            args : [4, filepath, "This file was added from within the EDIT APP"]
        }

        PythonShell.run('upload_download_file.py', options, (error, output) => {console.log(error);if (output === undefined) {alert("An error has occured. File deletion unsuccessful.");} else {alert(output); populate_page(current_folder);}});
    }
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
        let content_type = folder_contents_list[i].type.split(',')[0];
        
        if (content_type === 'file') {
            inner_html += `<a class="link-button" href="./edit_html_file.html?filename=${current_folder + "/" + folder_contents_list[i].name}"><div class="file-line"><div class="file-text-container"><img src="../icons/148705-essential-collection/svg/file-1.svg" class="file-icon"><p class="body-text">${folder_contents_list[i].name}</p></div><img src="./../icons/trash.png" class="trash-icon" onclick="delete_file(event, '${folder_contents_list[i].name}')"></div></a>`;
            
        } else if (content_type === 'folder') {
            inner_html += `<div class="folder-line" onclick="change_folder('${folder_contents_list[i].name}')"><p class="body-text">${folder_contents_list[i].name}</p></div>`;
        } 
    }
    
    let folder_name = directory_address.split('/').pop();
    title_h1_tag.textContent = folder_name || "Home";
    container_div.innerHTML = inner_html;
}


function toggle_file_creation_menu(command) {
    let dropdown_menu = document.querySelector(".file-creation-dropdown");
    if (command === "close") {
        dropdown_menu.style.height = "";
        
    } else if (command === "open") {
        dropdown_menu.style.height = "auto";
    }
}


//Initial populate
populate_page(current_folder);

let create_file_button = document.querySelector("#create-file-button");
let drop_down_menu = document.querySelector(".file-creation-dropdown")

create_file_button.addEventListener("mouseover", function (e) {
    toggle_file_creation_menu("open");
});

create_file_button.addEventListener("mouseleave", function (e) {
    toggle_file_creation_menu("close");
});

drop_down_menu.addEventListener("mouseover", function (e) {
    toggle_file_creation_menu("open");
});

drop_down_menu.addEventListener("mouseleave", function (e) {
    toggle_file_creation_menu("close");
});