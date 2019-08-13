from sys import argv
from ftplib import FTP
import mysql.connector 
from serci_settings import *

def upload_rerci_article(title, journal_str, year, authors, abstract, file_location_str):
    """Takes the nessesary inputs and uploads the given RERCI article PDF to the website and creates 
       a new entry in the MySQL database for that RERCI article.    
    """
    filename = file_location_str.split('/')[-1]
    
    #upload file
    with FTP('ftp.serci.org') as ftp:
        ftp.login(username, password)
        ftp.cwd('./html/rerci_files/')
        
        #check that a directory exists for the year we are about to go into
        directories = []
        callback = lambda x:  directories.append(x[-4:])
        ftp.retrlines('LIST', callback)
        
        if year not in directories:
            ftp.mkd("./" + year)
        
        ftp.cwd('./' + year)
    
        with open(file_location_str, 'rb') as file:
            ftp.storbinary('STOR ' + filename, file)    
            
    #open mysql connection
    database = mysql.connector.connect(host=mysql_host,
                                       user=mysql_user,
                                       passwd=mysql_password,
                                       database=mysql_database)
    
    db_cursor = database.cursor()
    
    #create the link
    link = './rerci_files/{}/{}'.format(str(year), filename)
    
    #insert into articles
    query = "INSERT INTO articles(link, title, journal, abstract, content, year, downloads, article_id) values (%s, %s, %s, %s, NULL, %s, 0, NULL)"
    values = (link, title, journal_str, abstract, year)
    db_cursor.execute(query, values)
    database.commit()    
    
    #insert authors
    author_values = ""
    for author in authors:
        author_values += "(LAST_INSERT_ID(), %s, NULL), "
    author_values = author_values[:-2]
    query = "INSERT INTO authors(article_id, name, author_id) values " + author_values
    
    db_cursor.execute(query, tuple(authors))
    database.commit()    
    
    print("Successfully uploaded the given RERCI article.")




def upload_congress_document(title, year, authors, file_location_str):
    """ Takes the nessesary arguments and then uploads the given Congress Document PDF and creates a 
        corresponding entry in the MySQL database. If a link is given, then only a MySQL entry is created.
    """
    
    filename = file_location_str.split('/')[-1]
    
    if not file_location_str.startswith("https://"):
        #Upload File
        with FTP('ftp.serci.org') as ftp:
            ftp.login(username, password)
            ftp.cwd('./html/congress_documents/')

            #check that a directory exists for the year we are about to go into
            directories = []
            callback = lambda x:  directories.append(x[-4:])
            ftp.retrlines('LIST', callback)

            if year not in directories:
                ftp.mkd("./" + year)

            ftp.cwd('./' + year)

            with open(file_location_str, 'rb') as file:
                ftp.storbinary('STOR ' + filename, file)    

        #create the link
        link = './congress_documents/{}/{}'.format(str(year), filename)
    
    else:
        #in this case the file_location_str is the link itself
        link = file_location_str
        
        
    #open mysql connection
    database = mysql.connector.connect(host=mysql_host,
                                       user=mysql_user,
                                       passwd=mysql_password,
                                       database=mysql_database)

    db_cursor = database.cursor()
    
    #insert into articles
    query = "INSERT INTO articles(link, title, journal, abstract, content, year, downloads, article_id) values (%s, %s, NULL, NULL, NULL, %s, NULL, NULL)"
    values = (link, title, year)
    db_cursor.execute(query, values)
    database.commit()
    
    #insert authors
    author_values = ""
    for author in authors:
        author_values += "(LAST_INSERT_ID(), %s, NULL), "
    author_values = author_values[:-2]
    query = "INSERT INTO authors(article_id, name, author_id) values " + author_values
    
    db_cursor.execute(query, tuple(authors))
    database.commit()
    
    print("Successfully uploaded the given congress document.")
    


def main ():
    file_type = argv[1]
    
    if file_type == 'RERCI ARTICLE':
        title = argv[2]
        year = argv[3]
        authors = argv[4].split(", ")
        journal_str = argv[5]
        abstract = argv[6]
        file_location_str = argv[7]
        
        upload_rerci_article(title, journal_str, year, authors, abstract, file_location_str)
    
    elif file_type == 'CONGRESS DOCUMENT':
        title = argv[2]
        year = argv[3]
        authors = argv[4].split(", ")
        file_location_str = argv[5]
        
        upload_congress_document(title, year, authors, file_location_str)
    
    else:
        raise ValueError('Unknown File Type')


if __name__ == "__main__":
    main()