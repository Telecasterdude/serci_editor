from ftplib import FTP
from sys import argv
from serci_settings import *

def main():
    
    input_folder = argv[1]
    with FTP('ftp.serci.org') as ftp:
            ftp.login(username, password)
            ftp.cwd(input_folder)
            
            return_list = []
            ftp.retrlines('LIST', lambda x : (return_list.append(x)))
            return_str = '\n'.join(return_list)
            print(return_str)
            

if __name__ == "__main__":
    main()