from truckfinder import app, db
from seeds.food_trucks import seed_food_trucks
from seeds.menu_items import seed_menu_items

if __name__ == "__main__":
    with app.app_context():
        print("Resetting database...")

        # Gets rid of all the data in the db so it has a fresh slate
        db.drop_all()
        # Remakes all of db
        db.create_all()

        # Calls both functions so it is both made in the db
        seed_food_trucks()
        seed_menu_items()

        # Prints this message when done
        print("Database reset and seeded successfully!")