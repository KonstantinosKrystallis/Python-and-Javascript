# Final Project

## Introduction

In this project I've created a simple web app that allows the user to play tic tac toe and provides the following features:

1. Lets the user play a game of tic-tac-toe against an AI and scores them based on the result(win, loss, tie).
2. Allows logged in users to track their played games(If registered and logged in).
3. Gives access to a leaderboard were the top 100 players are tracked (based on their total score).
4. Enables users to view a custom ranking board of _watched_ players.
5. Logged in users can view all registered users (including their self) and search for specific user.

Additionally admins have access to a debug panel created for the purpose of testing this app.

## The Game

In my implementation of the game 'X' is always the user and 'O' the AI. Traditionally 'X' always goes first, but in this case hhe play order is decided randomly at the start of the game. This is the only change I've made in the game.

## The AI

For the AI to make it's moves the minimax algorithm has been used. However because the algorithm guarantees the AI will make the best move possible(which as result causes the games to end in either a tie or a loss for the user), the first two moves by the AI are decided randomly. This gives the opportunity to the user to pursue a win. Additionally by randomizing the first two moves the search tree of the algorithm is reduced significantly in size, making calculations faster.

## Distinctiveness and Complexity

I believe this project to be far more distinctive than the others on this course due to its base concept, it's an interactive game. While on the surface some features appear similar to those of other projects, they have been adjusted to the context of the game. Complexity wise two features stand out, the game and the search user function.

- The search function allows the user to search for a user and narrow down the results in real time, as they type in the search query.
- The game is made up of three distinct 'parts' that make it work. The game board which accepts user input and displays it and provides visual feedback in realtime, the AI that calculates the next move and the functions that inform the server in a asynchronous way, of the game's progress.
- Additionally this time no Bootstrap was used. Instead everything was styled using 'vanilla' CSS.

## The Files

### Static Files

- control.css: Styles the Debug Panel and is only load when an admin request the page,
- navbar.css: Defines the style of the navbar.
- styles.css: The main styling file.

- ControlPanel.jsx: Is responsible for rendering the Debug Panel and handling related requests to the server.
- Game.jsx: Is responsible for rendering the gameboard, enabling the AI and handling related requests to the server.
- utils.js: Contains functions that help make data reader friendly.
- Leaderboard.jsx, Profile.jsx, Search.jsx: Are for rendering the corresponding pages and handling related requests to the server.

### Template Files

- layout.html: The main html file containing the navbar component.
- index.html: The default page of the app and where the game component is rendered.
- Rest of the html files are there to enable the rendering of their corresponding components.

### Python Files

- models.py: Contains the models of the project and their functions.
- urls.py: Contains all the available paths of the app.
- util.py: Contains two helper functions used in the views.
- views.py: Contains all the views which enable the handling of the requests made from the client to the server and the corresponding replies.

## Running the App

1.  Make sure you have have set up the requirements.txt.
2.  Make sure you have [PostgreSQL 13.3](https://www.postgresql.org/download/) installed.
3.  Make sure the setting.py file is setup correctly for your PostgreSQL installation(see Note 1).
4.  In a command terminal, navigate to the project folder and use 'python manage.py runserver'.
5.  (Optional, but recommended) Create a super user via. In a command terminal, navigate to the project folder and use 'python manage.py createsuperuser' and the follow the on screen instructions.

### Note 1

The following are the setting for the database in settings.py.

        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'tictac', # Name of your database
                'USER': 'postgres', # Name of admin user
                'PASSWORD':'root', # Password of admin user
                'HOST':'localhost', # URL to where your DB is hosted
                'PORT':'5432', # Port used by your DB
            }
        }

Depending on how you have set up your PostgreSQL these might need to be modified to match your installation.

## Known issues

1. On mobile the player's winning combinations are not highlighted properly at the end of the game(if the user clicks anywhere on the app it appears).
2. If there are two winning combinations only the first to be found will be highlighted.
3. In some rare cases the match results are not sent to the server for storage.
