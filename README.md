# Drexel Food Truck Interactive Map
Drexel Food Truck Interactive Map is a map displaying food trucks on Drexel Campus. The application uses Flask and SQLAlchemy to manage food truck data and render it dynamically.

## Features

- View food trucks
- View menu items for each truck
- Store and retrieve data using a database
- JSON responses for API-style endpoints
- Clean Flask + SQLAlchemy architecture
- Find quickest route to each truck

## Technologies Used

- Python 3.10+
- Flask
- Flask-SQLAlchemy
- SQLite
- HTML (Jinja templates)

## Installation
Follow these steps to run this project locally

1. Clone Repository

```bash
git clone <https://gitlab.cci.drexel.edu/cid/2526/ws1023/62/gc3/drexel-food-truck-interactive-map.git>
cd drexel-food-truck-interactive-map
```

2. Create and Activate a Virtual Enviroment

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install Required Dependencies 

```bash
pip install -r requirements.txt
```

4. Database Setup

This application runs on CSV files for each scheme of food truck, food truck menu items, as well as the food truck closing times. If you make any changes to any of these tables, run the following command in your terminal
```bash
python seed.py
```

5. Running the Application

Run this command to startup your locally hosted website

```bash
python run.py
```

## License
[MIT](https://gitlab.cci.drexel.edu/cid/2526/ws1023/62/gc3/drexel-food-truck-interactive-map/-/blob/main/LICENSE?ref_type=heads)