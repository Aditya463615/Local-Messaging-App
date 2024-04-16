// tab system 
var tabs = document.querySelectorAll(`[tab-system]`);
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            if (t !== tab) {
                t.classList.remove('active_tab')
            }
        });
        tab.classList.toggle('active_tab')
        var target_content_ID = tab.getAttribute('for');
        var content = document.querySelector(`main#${target_content_ID}`);
        var contents = document.querySelectorAll('[tab-container]');
        contents.forEach(c => {
            if (c !== content) {
                c.classList.toggle('home');
                c.setAttribute('hidden', '');
            }
        });
        console.log(`tab is switched for #${target_content_ID}`);
        content.classList.add('home');
        content.removeAttribute('hidden');
    })
})

// contact system
function contact(c) {
    var recipients_name_container = document.querySelector('.recipients-details');
    var message_box = document.querySelector('.message-box');
    recipients_name_container.innerHTML = c.innerHTML;
    recipients_name_container.setAttribute('sid', c.getAttribute('recipients'));
    var cnt = document.querySelectorAll('[recipients]');
    cnt.forEach(cd => {
        if (cd !== c) {
            cd.classList.remove('active_tab');
        } else {
            cd.classList.add('active_tab');
        }
    });

    // Reset appearance of all message boxes
    var all_message_boxes = document.querySelectorAll('.message-box');
    all_message_boxes.forEach(box => {
        box.setAttribute('hidden', '');
    });

    // Check if a message box exists for the selected contact
    var selected_sid = c.getAttribute('recipients');
    var selected_message_box = document.querySelector(`.message-box[receiver_address="${selected_sid}"]`);
    if (selected_message_box) {
        // If message box exists, show it
        selected_message_box.removeAttribute('hidden');
    } else {
        // If message box doesn't exist, create it dynamically
        var new_message_box = document.createElement('div');
        new_message_box.classList.add('message-box');
        new_message_box.setAttribute('receiver_address', selected_sid);
        message_box.parentNode.insertBefore(new_message_box, message_box.nextSibling);
    }
}

var send_message_button = document.querySelector('#send_message');
send_message_button.addEventListener('click', function () {
    var message = document.querySelector('#message-input').value;
    var recipients = document.querySelector('.recipients-details').getAttribute('sid');
    send_message(message, recipients);

    var all_message_box = document.querySelectorAll('.message-box');
    all_message_box.forEach(m => {
        if (m.getAttribute('receiver_address') != recipients) {
            m.setAttribute('hidden', '');
        } else {
            m.removeAttribute('hidden');
        }
    });
    var mgs_bx = document.querySelector(`[receiver_address='${recipients}']`);
    var bubble = document.createElement('div');
    bubble.setAttribute('class', 'message-bubble');
    bubble.innerHTML = `<div class="message-out message"><div hidden class="sender-details">${recipients}</div><div class="text">${message}</div><div class="message-info"><span class="time">${(new Date()).getHours()}:${(new Date()).getMinutes()}</span></div></div>`;
    mgs_bx.append(bubble);
    document.querySelector('#message-input').value = '';
})

function impliment_received_message(data) {
    var message = data.message;
    var sender_name = data.sender_name;
    var sender_sid = data.sender;

    // finding sender in the contact list
    var c = document.querySelector(`[recipients="${sender_sid}"]`);
    
    // message box header 
    var recipients_name_container = document.querySelector('.recipients-details');

    // message box body
    var message_box = document.querySelector('.message-box');

    // adding values
    recipients_name_container.innerHTML = c.innerHTML;
    recipients_name_container.setAttribute('sid', c.getAttribute('recipients'));
    var cnt = document.querySelectorAll('[recipients]');
    cnt.forEach(cd => {
        if (cd !== c) {
            cd.classList.remove('active_tab');
        } else {
            cd.classList.add('active_tab');
        }
    });


    // Reset appearance of all message boxes
    var all_message_boxes = document.querySelectorAll('.message-box');
    all_message_boxes.forEach(box => {
        box.setAttribute('hidden', '');
    });

    // Check if a message box exists for the selected contact
    var selected_sid = sender_sid;
    var selected_message_box = document.querySelector(`.message-box[receiver_address="${selected_sid}"]`);
    if (selected_message_box) {
        // If message box exists, show it
        selected_message_box.removeAttribute('hidden');

        var bubble = document.createElement('div');
        bubble.setAttribute('class', 'message-bubble');
        bubble.innerHTML = `<div class="message-in message"><div hidden class="sender-details">${sender_name}</div><div class="text">${message}</div><div class="message-info"><span class="time">${(new Date()).getHours()}:${(new Date()).getMinutes()}</span></div></div>`;
        selected_message_box.append(bubble);
        alert(`${sender_name} sent you a message.`);
    } else {
        // If message box doesn't exist, create it dynamically
        var message_box = document.querySelector('.message-box');
        var new_message_box = document.createElement('div');
        new_message_box.classList.add('message-box');
        new_message_box.setAttribute('receiver_address', selected_sid);
        message_box.parentNode.insertBefore(new_message_box, message_box.nextSibling);
        
        var bubble = document.createElement('div');
        bubble.setAttribute('class', 'message-bubble');
        bubble.innerHTML = `<div class="message-in message"><div hidden class="sender-details">${sender_name}</div><div class="text">${message}</div><div class="message-info"><span class="time">${(new Date()).getHours()}:${(new Date()).getMinutes()}</span></div></div>`;
        new_message_box.append(bubble);
        alert(`${sender_name} sent you a message.`);
    }
}
