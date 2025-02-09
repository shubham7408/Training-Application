from datetime import datetime

# Data structure to store user assignments with timestamps
user_assignments = {}

def assign_task(user, task, language):
    """
    Assign a task to a user based on their language expertise.
    """
    today = datetime.now().date()
    if user in user_assignments:
        assignments = user_assignments[user]
        if any(assignment['date'] == today for assignment in assignments):
            print(f"User {user} already has tasks assigned today.")
            return False
        if any(assignment['language'] != language for assignment in assignments):
            print(f"User {user} is already assigned a task in another language.")
            return False
    else:
        user_assignments[user] = []

    user_assignments[user].append({
        'task': task,
        'language': language,
        'date': today
    })
    print(f"Assigned {language} task to user {user}.")
    return True

def check_user_assignment(user):
    """
    Check if a user is already assigned a task in another language.
    """
    return user_assignments.get(user, None)

# Example usage
if __name__ == "__main__":
    assign_task("user1", "task1", "python")
    assign_task("user1", "task2", "java")
    assign_task("user2", "task3", "java")
    print(check_user_assignment("user1"))
    print(check_user_assignment("user2"))
