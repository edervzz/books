# Books API by Oscar Eder Velázquez Pineda

REST Service to serve information about book wishlist and using API Google Book. 
This project requires __docker-compose__ to launch api and database (mongo).

- **Post Methods**
    - `/signup`: To registry a new user.
    - `/signin`: To login with user registed previously and return an access token.
    - `/wishlist`: To create a new wishlist.
    - `/wishlist/<wishlist-id>/books`: Add a book to wishlist assigned.
- **Get Methods**
    - `/books/?title=<title book>^&author=<author>&publisher=<publisher>&key=<google-books-api-key>`: To search a book.
    - `/wishlist`: To retrieve all wishlist created by user.
    - `/wishlist/<wishlist-id>`: To retrieve a wishlist and its books created by user.
- **Delete Methods**
    - `/wishlist/{wishlist-id}`: Delete a wishlist by user.
    - `/wishlist/<wishlist-id>/books/<bookId>`: Delete a book from wishlist by user.

## Running Locally

1. Clone repository:

    ```bash
    git clone https://github.com/eder-abi/booksApiV2.git 
    ```

2. Build API:

    ```bash
    docker-compose build
    ```

3. Execute Project:

    ```bash
    docker-compose up
    ```

## API Examples
1. To registry a new user.
    - WIN
        ```bash
        curl -X POST http://localhost:3000/api/signup -H "Content-Type: application/json" -d "{\"username\":\"eder\",\"password\":\"pwd1\"}"
        ```
    - LINUX
        ```bash
        curl --location --request POST 'http://localhost:3000/api/signup' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "username": "eder1",
            "password": "pwd1"
        }'
        ```
    - Response
        ```http
        201
        ```
        ```bash
        Sign up OK, please login.
        ```

2. To login with user registed previously and return an access token.
    - WIN
        ```bash
        curl -X POST http://localhost:3000/api/signin -H "Content-Type: application/json" -d "{\"username\":\"eder\",\"password\":\"pwd1\"}"
        ```
    - LINUX
        ```bash
        curl --location --request POST 'http://localhost:3000/api/signin' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "username": "eder",
            "password": "pwd1"
        }'
        ```
    - Response (access token)
        ```http
        200
        ```
        ```bash
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZWRlciIsImlhdCI6MTYzMTc2NDE3OX0.-y0KKusxTB3BdSVaQFjPJ-vKZLn8zbpwwFvORHjeOj8"
        }
        ```

3. To create a new wishlist.
    - WIN
        ```bash
        curl -X POST http://localhost:3000/api/wishlist -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN" -d "{\"name\":\"Lista 001\"}"
        ```
    - LINUX
        ```bash
        curl --location --request POST 'http://localhost:3000/api/wishlist' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "name": "Lista 001"
        }'
        ```
    - Response
        ```http
        201
        ```

4. To search a book.
    - WIN
        ```bash
        curl http://localhost:3000/api/books?title=Silmarillion^&author=Tolkien^&publisher=Grupo+Planeta+Spain^&key=AIzaSyASo8XKSmmll_QoPh9lvXOuWJ4ViqkglZM -H "x-auth-token: ACCESS_TOKEN"
        ```
    - LINUX
        ```bash
        curl --location --request GET 'http://localhost:3000/api/books?author=Tolkien&publisher=Grupo Planeta Spain&key=AIzaSyASo8XKSmmll_QoPh9lvXOuWJ4ViqkglZM&title=Silmarillion' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --data-raw ''
        ```
    - Response (books found)
        ```http
        200
        ```
        ```bash
        {
            "items": [
                {
                    "bookId": "_LIfNCn06J8C",
                    "title": "El Libro de los Cuentos Perdidos Historia de la Tierra Media, 1",
                    "authors": [
                        "J. R. R. Tolkien"
                    ],
                    "publisher": "Grupo Planeta Spain",
                    "language": "es"
                },
                {
                    "bookId": "E8pnh7H5gMgC",
                    "title": "Cuentos desde el reino peligroso",
                    "authors": [
                        "J. R. R. Tolkien"
                    ],
                    "publisher": "Grupo Planeta Spain",
                    "language": "es"
                }
            ]
        }
        ```

5. Add a book to wishlist assigned.
    - WIN
        ```bash
        curl -X POST http://localhost:3000/api/wishlist/1/books -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN" -d "{\"bookId\":\"_LIfNCn06J8C\",\"title\":\"El Libro de los Cuentos Perdidos Historia de la Tierra Media, 1\",\"authors\":[\"J. R. R. Tolkien\"],\"publisher\":\"Grupo Planeta Spain\",\"language\":\"es\"}"
        ```
    - LINUX
        ```bash
        curl --location --request POST 'http://localhost:3000/api/wishlist/1/books' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "bookId": "_LIfNCn06J8C",
            "title": "El Libro de los Cuentos Perdidos Historia de la Tierra Media, 1",
            "authors": [
                "J. R. R. Tolkien"
            ],
            "publisher": "Grupo Planeta Spain",
            "language": "es"
        }'       
        ```
    - Response
        ```http
        201
        ```

6. To retrieve all wishlist created by user.
    - WIN
        ```bash
        curl http://localhost:3000/api/wishlist -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN"
        ```
    - LINUX
        ```bash
        curl --location --request GET 'http://localhost:3000/api/wishlist' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --data-raw ''
        ```
    - Response (list of wishlist)
        ```http
        200
        ```
        ```bash
        [
            {
                "WishlistsId":1,
                "UserId":1,
                "Name":"Lista 001"
            },
            {
                "WishlistsId":2,
                "UserId":1,
                "Name":"Lista 002"
            }
        ]
        ```

7. To retrieve a wishlist and its books created by user.
    - WIN
        ```bash
        curl http://localhost:3000/api/wishlist/1 -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN"
        ```
    - LINUX
        ```bash
        curl --location --request GET 'http://localhost:3000/api/wishlist/1' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --data-raw ''
        ```
    - Response (wishlist and books)
        ```http
        200
        ```
        ```bash
        {
            "user":"eder",
            "name":"Lista 001",
            "books":[
                {
                    "bookId":"_LIfNCn06J8C",
                    "title":"El Libro de los Cuentos Perdidos Historia de la Tierra Media, 1",
                    "authors":[
                        "J. R. R. Tolkien"
                    ],
                    "publisher":"Grupo Planeta Spain",
                    "language":"es"
                }
            ]
        }
        ```

8. Delete a book from wishlist.
    - WIN
        ```bash
        curl -X DELETE http://localhost:3000/api/wishlist/1/books/_LIfNCn06J8C -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN"
        ```
    - LINUX
        ```bash
        curl --location --request DELETE 'http://localhost:3000/api/wishlist/Lista 001/books/_LIfNCn06J8C' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --header 'Content-Type: application/json' \
        --data-raw ''
        ```
    - Response
        ```http
        200
        ```

9. Delete a wishlist.
    - WIN
        ```bash
        curl -X DELETE http://localhost:3000/api/wishlist/1 -H "Content-Type: application/json" -H "x-auth-token: ACCESS_TOKEN"
        ```
    - LINUX
        ```bash
        curl --location --request DELETE 'http://localhost:3000/api/wishlist/Lista 001' \
        --header 'x-auth-token: ACCESS_TOKEN' \
        --data-raw ''
        ```
    - Response
        ```http
        200
        ```
