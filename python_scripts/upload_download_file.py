from sys import argv
import requests
import base64
import json
from serci_settings import *

def is_good_status_code(status_code):
    """Returns true if the status code indicates no errors or anomalies occured"""
    
    return 200 <= status_code and status_code < 300


def get_file_dict(filename):
    """ Takes a filename (filenames include a folder if they are in a folder) and returns 
        the file dict/json recived through the github api
    """
    
    url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + filename
    headers = {'Accept': 'application/vnd.github.v3+json', 
           'Authorization': 'token {}'.format(API_KEY)}

    req = requests.get(url, headers=headers)
    
    if not is_good_status_code(req.status_code):
        raise RuntimeError("Something bad occurred, I received a status code of {} when trying to fill out your request".format(req.status_code))
        
    file_dict = req.json()
    return file_dict


def main():
    mode = int(argv[1])
    filename = argv[2]
    
    #download an existing file
    if mode == 0:
        file_dict = get_file_dict(filename)
        print(base64.b64decode(file_dict['content']).decode("UTF-8"))
        
    #edit an existing file
    elif mode == 1:
        #first get the sha of the file we want to edit
        file_dict = get_file_dict(filename)
        sha = file_dict['sha']
        
        data = argv[3] #get the string of the new data the user wants in the file
        message = argv[4]

        #now proceed as if creating a new file, but specify the sha in the data
        encoded_bytes = base64.b64encode(data.encode("utf-8"))
        encoded_str = str(encoded_bytes, "utf-8")

        url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + filename
        headers = {'Accept': 'application/vnd.github.v3+json', 
                   'Authorization': 'token {}'.format(API_KEY)}
        data = {'message' : message, 
                'content' : encoded_str,
                'branch' : 'master',
                'sha' : sha
                }
        data = json.dumps(data)

        req = requests.put(url, data=data, headers=headers)
        
        if is_good_status_code(req.status_code):
            print("File update successful.")
            
        else:
            raise RuntimeError("Something bad occurred, I received a status code of {} when trying to fill out your request.\n The message I received from the server was:\n {}".format(req.status_code, req.json()))
    
    
    #upload a new file from PC
    elif mode == 2:
        filepath_on_server = filename
        filepath_on_pc = argv[3] #the location of the file on the computer, must be an absolute filepath
        message = argv[4]
        
        with open(filepath_on_pc, 'rb') as file:
            file_bytes = file.read()
        
        encoded_bytes = base64.b64encode(file_bytes)
        encoded_str = str(encoded_bytes, "utf-8")
        
        
        url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + filepath_on_server
        headers = {'Accept': 'application/vnd.github.v3+json', 
                   'Authorization': 'token {}'.format(API_KEY)}
        data = {'message' : message, 
                'content' : encoded_str,
                'branch' : 'master',
                }
                
        data = json.dumps(data)

        req = requests.put(url, data=data, headers=headers)
        
        if is_good_status_code(req.status_code):
            print("File update successful.")
            
        else:
            raise RuntimeError("Something bad occurred, I received a status code of {} when trying to fill out your request.\n The message I received from the server was:\n {}".format(req.status_code, req.json()))
    
    
    #upload a new file created by user
    elif mode == 3:
        data = argv[3]
        message = argv[4]
        
        encoded_bytes = base64.b64encode(data.encode("utf-8"))
        encoded_str = str(encoded_bytes, "utf-8")
        
        
        url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + filename
        headers = {'Accept': 'application/vnd.github.v3+json', 
                   'Authorization': 'token {}'.format(API_KEY)}
        data = {'message' : message, 
                'content' : encoded_str,
                'branch' : 'master',
                }
                
        data = json.dumps(data)

        req = requests.put(url, data=data, headers=headers)
        
        if is_good_status_code(req.status_code):
            print("File creation successful.")
            
        else:
            raise RuntimeError("Something bad occurred, I received a status code of {} when trying to fill out your request.\n The message I received from the server was:\n {}".format(req.status_code, req.json()))
    
    #delete file
    elif mode == 4:
        message = argv[3]
        
        #get the sha of the file we want to delete
        file_dict = get_file_dict(filename)
        sha = file_dict['sha']
        
        url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + filename
        headers = {'Accept': 'application/vnd.github.v3+json', 
                   'Authorization': 'token {}'.format(API_KEY)}
        data = {'message' : message, 
                'branch' : 'master',
                'sha' : sha,
                }
        
        data = json.dumps(data)

        req = requests.delete(url, data=data, headers=headers)
        
        if is_good_status_code(req.status_code):
            print("File deletion successful.")
            
        else:
            raise RuntimeError("Something bad occurred, I received a status code of {} when trying to fill out your request.\n The message I received from the server was:\n {}".format(req.status_code, req.json()))
    
    else:
        raise ValueError
            
if __name__ == "__main__":
    main()