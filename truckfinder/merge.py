from truckfinder import db
from truckfinder.models import FoodTruck, SubmittedTruck

# This function is used to actually merge the trucks to the main db
def merge_submitted_trucks():
    submitted = SubmittedTruck.query.filter_by(
        is_approved=True,
        merged=False       # only grab unmerged ones
    ).all()

    added, skipped = 0, 0

    for sub in submitted:
        exists = FoodTruck.query.filter_by(name=sub.name).first()
        # If the name is already in the schema, it skips it
        if exists:
            skipped += 1
            sub.merged = True  # mark as merged even if skipped
            continue

        # Creates new instance of truck
        truck = FoodTruck(
            name=sub.name,
            latitude=sub.latitude,
            longitude=sub.longitude,
            is_hidden=True
        )
        # Adds it to the db
        db.session.add(truck)
        sub.merged = True  # mark as merged
        added += 1

    db.session.commit()
    return {"added": added, "skipped": skipped}