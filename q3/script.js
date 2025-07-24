const form = document.getElementById('reportForm');
const messages = document.getElementById('messages');
const complaintsContainer = document.getElementById('complaints');

if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    messages.innerHTML = '';
    const errors = [];

    const boxId = document.getElementById('boxId').value.trim();
    const boxColor = document.getElementById('boxColor').value.trim();
    const tone = document.getElementById('tone').value;
    const mailCount = document.getElementById('mailCount').value.trim();
    const closed = document.getElementById('closed').checked;
    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value.trim();

    if (boxId === '' || isNaN(boxId) || boxId < 1 || boxId > 999) {
      errors.push('מזהה תיבה הוא בין - 1 ל - 999');
    }
    if (!email.includes('@') || !email.includes('.')) {
      errors.push('יש להזין כתובת אימייל תקינה');
    }
    if (mailCount === '' || isNaN(mailCount) || mailCount < 0) {
      errors.push('כמות הדואר חייבת להיות מספר חיובי');
    }
    if (tone === '') {
      errors.push('יש לבחור טון דיבור');
    }
    if (userType === '') {
      errors.push('יש לבחור סוג משתמש');
    }
    if (tone === 'רגזן' && Number(mailCount) === 0) {
      errors.push('תיבה רגזנית לא יכולה להיות עם 0 מכתבים');
    }

    if (errors.length > 0) {
      errors.forEach(err => {
        const p = document.createElement('p');
        p.className = 'error';
        p.textContent = err;
        messages.appendChild(p);
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      boxId,
      boxColor,
      tone,
      mailCount: Number(mailCount),
      closed,
      userType,
      email,
      status: 'דורשת טיפול'
    };

    saveItem(newItem);
    form.reset();
    const success = document.createElement('p');
    success.className = 'success';
    success.textContent = 'התלונה נשמרה בהצלחה!';
    messages.appendChild(success);
  });
}

function saveItem(item) {
    const items = loadItems();
    items.push(item);
    localStorage.setItem('complaints', JSON.stringify(items));
}

function loadItems() {
    const stored = localStorage.getItem('complaints');
    return stored ? JSON.parse(stored) : [];
}

function deleteItem(id) {
    let items = loadItems();

    let newItems = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].id != id) {
            newItems.push(items[i]);
        }
    }
    items = newItems;

    localStorage.setItem('complaints', JSON.stringify(items));
    renderItems();
}

function updateItem(id) {
  let items = loadItems();
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == id) {
      items[i].status = (items[i].status === 'דורשת טיפול') ? 'תיבה רגועה' : 'דורשת טיפול';
      break;
    }
  }
  localStorage.setItem('complaints', JSON.stringify(items));
  renderItems();
}

function renderItems() {
    if (!complaintsContainer) return;
    const items = loadItems();
    complaintsContainer.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'complaint-card';
        card.innerHTML = `
        <h4>תיבה מספר: #${item.boxId}</h4> 
         <p>צבע: ${item.boxColor}</p>
         <p>טון: ${item.tone}</p>
         <p>כמות דואר: ${item.mailCount}</p>
         <p>סוג משתמש: ${item.userType}</p>
         <p>סטטוס: ${item.status}</p>
         <button class="btn-status" data-id="${item.id}">שנה סטטוס</button>
         <button class="btn-delete" data-id="${item.id}">מחק</button>

        `;
        complaintsContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-status').forEach(btn => {
        btn.addEventListener('click', () => {
            updateItem(btn.dataset.id);
        });
    });

    renderStats();
}

function renderStats() {
    const statsContainer = document.getElementById('stats');
    if (!statsContainer) return;

    const items = loadItems();
    const counts = {};

    items.forEach(item => {
        counts[item.userType] = (counts[item.userType] || 0) + 1;
    });

statsContainer.innerHTML = '<h3>ספירה לפי סוג משתמשים</h3>';

    for (const type in counts) {
        const p = document.createElement('p');
        p.textContent = `${type} : ${counts[type]} תלונות`;
        statsContainer.appendChild(p);
    }
}

if (complaintsContainer) {
  document.addEventListener('DOMContentLoaded', renderItems);
}