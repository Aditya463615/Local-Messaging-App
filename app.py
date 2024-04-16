from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import cv2
from datetime import datetime

app = Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

users = {}

admin_list = []
staff_list = []
client_list = []

@app.route('/admin/<username>')
def admin_page(username):
    return render_template('admin.html', username=username, user_type='admin')

@app.route('/staff/<username>')
def staff_page(username):
    return render_template('staff.html', username=username, user_type='staff')

@app.route('/client/<username>')
def client_page(username):
    return render_template('client.html', username=username, user_type='client')

@socketio.on('connect')
def connect():
    # scrap the basic details
    user_ip = request.remote_addr
    user_sid = request.sid

    # save user information
    users[user_sid] = {'IP':user_ip, 'Connected_at':datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 'Varification':'NOT VERIFIED', 'user_type':'NULL'}

    # display connection successful message
    print(f'User connected [NOT VERIFIED] {user_ip}\t{user_sid}')

    for admin in admin_list + staff_list + client_list:
        emit('update_web_app', {'message':'USER CONNECTED', 'users':users}, room=admin)

@socketio.on('verify_user')
def verify_user(data):
    # scrap the basic details 
    user_ip = request.remote_addr
    user_sid = request.sid
    user_type = data['user_type']
    user_name = data['user_name']

    users[user_sid]['user_type'] = user_type
    users[user_sid]['user_name'] = user_name

    # filter the user_type
    if user_type == 'admin':
        # add user into into group
        admin_list.append(user_sid)
        # display user connection verification successful
        print(f'Connected user [VERIFIED] {user_ip}\t{user_sid}')
        users[user_sid]['Varification'] = 'VERIFIED'
    elif user_type == 'staff':
        staff_list.append(user_sid)
        print(f'Connected user [VERIFIED] {user_ip}\t{user_sid}')
        users[user_sid]['Varification'] = 'VERIFIED'
    elif user_type == 'client':
        client_list.append(user_sid)
        print(f'Connected user [VERIFIED] {user_ip}\t{user_sid}')
        users[user_sid]['Varification'] = 'VERIFIED'
    else:
        print(f'Connected user [NOT AUTHORISED] {user_ip}\t{user_sid}')
        users[user_sid]['Varification'] = 'NOT AUTHORISED'

    emit('update_web_app', {'message':'USER CONNECTED', 'users':users}, broadcast=True)
'''
    for admin in admin_list:
        emit('update_web_app', {'message':'USER CONNECTED', 'users':users}, room=admin)
'''
@socketio.on('disconnect')
def disconnect():
    # scrap the basic details
    user_ip = request.remote_addr
    user_sid = request.sid

    user_type = users[user_sid]['user_type']
    verification_status = users[user_sid]['Varification']

    # save user information
    users.pop(user_sid)

    # display connection successful message
    print(f'User disconnected {user_ip}\t{user_sid}\t{user_type}\t{verification_status}')

    emit('update_web_app', {'message':'USER CONNECTED', 'users':users}, broadcast=True)
'''
    for admin in admin_list + staff_list + client_list:
        emit('update_web_app', {'message':'USER CONNECTED', 'users':users}, room=admin)
'''    
@socketio.on('send_message')
def send_message(data):
    # scrap basic details
    sender_sid = request.sid
    recipients = data['recipients']
    message = data['message']

    # filter the recipient group
    if recipients == 'admin':
        for admin in admin_list:
            # send message to all the group members
            emit('message_from_user', {'message':message, 'sender':sender_sid, 'sender_name':users[sender_sid]['user_name']}, room=admin)
    elif recipients == 'client':
        for client in client_list:
            emit('message_from_user', {'message':message, 'sender':sender_sid, 'sender_name':users[sender_sid]['user_name']}, room=client)
    elif recipients == 'staff':
        for staff in staff_list:
            emit('message_from_user', {'message':message, 'sender':sender_sid, 'sender_name':users[sender_sid]['user_name']}, room=staff)
    else:
        # if recipient group is neither admin, staff not client
        emit('message_from_user', {'message':message, 'sender':sender_sid, 'sender_name':users[sender_sid]['user_name']}, room=recipients)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='192.168.31.151', port=80)