class ContactsApp {
    constructor() {
        this.contacts = [];
        this.currentEditingId = null;
        this.filteredContacts = [];
        
        this.initializeElements();
        this.loadContacts();
        this.bindEvents();
        this.generateAlphabetIndex();
    }
    
    initializeElements() {
        // Botones y modales
        this.addBtn = document.getElementById('addBtn');
        this.contactModal = document.getElementById('contactModal');
        this.detailModal = document.getElementById('detailModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.backBtn = document.getElementById('backBtn');
        this.editBtn = document.getElementById('editBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // Formulario
        this.modalTitle = document.getElementById('modalTitle');
        this.firstName = document.getElementById('firstName');
        this.lastName = document.getElementById('lastName');
        this.phone = document.getElementById('phone');
        this.email = document.getElementById('email');
        this.company = document.getElementById('company');
        
        // Lista y búsqueda
        this.contactsList = document.getElementById('contactsList');
        this.searchInput = document.getElementById('searchInput');
        this.alphabetIndex = document.getElementById('alphabetIndex');
        
        // Modal de detalles
        this.detailName = document.getElementById('detailName');
        this.detailPhone = document.getElementById('detailPhone');
        this.detailEmail = document.getElementById('detailEmail');
        this.detailCompany = document.getElementById('detailCompany');
        this.detailPhoto = document.getElementById('detailPhoto');
        this.detailInitials = document.getElementById('detailInitials');
    }
    
    bindEvents() {
        // Eventos de botones
        this.addBtn.addEventListener('click', () => this.openAddModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.saveContact());
        this.backBtn.addEventListener('click', () => this.closeDetailModal());
        this.editBtn.addEventListener('click', () => this.editCurrentContact());
        this.deleteBtn.addEventListener('click', () => this.deleteCurrentContact());
        
        // Búsqueda
        this.searchInput.addEventListener('input', (e) => this.searchContacts(e.target.value));
        
        // Cerrar modal al hacer click fuera
        this.contactModal.addEventListener('click', (e) => {
            if (e.target === this.contactModal) this.closeModal();
        });
        
        this.detailModal.addEventListener('click', (e) => {
            if (e.target === this.detailModal) this.closeDetailModal();
        });
        
        // Validación en tiempo real
        this.phone.addEventListener('input', (e) => this.formatPhone(e));
        
        // Eventos para llamar, mensaje y email
        this.detailModal.querySelector('.contact-actions').addEventListener('click', (e) => {
            if (this.currentEditingId === null) return;

            const contact = this.contacts.find(c => c.id === this.currentEditingId);
            if (!contact) return;

            const target = e.target.closest('button');
            if (!target) return;

            if (target.textContent.includes('Llamar')) {
                if (contact.phone) {
                    window.location.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
                } else {
                    alert('Teléfono no disponible');
                }
            } else if (target.textContent.includes('Mensaje')) {
                if (contact.phone) {
                    window.location.href = `sms:${contact.phone.replace(/\s+/g, '')}`;
                } else {
                    alert('Teléfono no disponible para mensajes');
                }
            } else if (target.textContent.includes('Email')) {
                if (contact.email) {
                    window.location.href = `mailto:${contact.email}`;
                } else {
                    alert('Email no disponible');
                }
            }
        });
        
        // Evento índice alfabético
        this.alphabetIndex.addEventListener('click', (e) => {
            if (e.target.dataset.letter) {
                this.scrollToLetter(e.target.dataset.letter);
            }
        });
    }
    
    generateAlphabetIndex() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
        this.alphabetIndex.innerHTML = alphabet.map(letter => 
            `<span data-letter="${letter}">${letter}</span>`
        ).join('');
    }
    
    async loadContacts() {
        try {
            const response = await fetch('./agenda.json');
            if (response.ok) {
                this.contacts = await response.json();
            } else {
                this.contacts = this.getDefaultContacts();
            }
        } catch (error) {
            this.contacts = this.getDefaultContacts();
        }
        this.renderContacts();
    }
    
    getDefaultContacts() {
        return [
            { id: 1, firstName: "Ana", lastName: "García López", phone: "+34 612 345 678", email: "ana.garcia@email.com", company: "Apple Inc." },
            { id: 2, firstName: "Carlos", lastName: "Rodríguez", phone: "+34 698 765 432", email: "carlos.rodriguez@email.com", company: "Google" },
            { id: 3, firstName: "María", lastName: "Fernández", phone: "+34 655 123 789", email: "maria.fernandez@email.com", company: "Microsoft" },
            { id: 4, firstName: "David", lastName: "Martínez", phone: "+34 677 890 123", email: "david.martinez@email.com", company: "Meta" },
            { id: 5, firstName: "Laura", lastName: "Sánchez", phone: "+34 633 456 789", email: "laura.sanchez@email.com", company: "Amazon" }
        ];
    }
    
    renderContacts(contactsToRender = null) {
        const contacts = contactsToRender || this.contacts;
        const groupedContacts = this.groupContactsByLetter(contacts);
        
        this.contactsList.innerHTML = '';
        
        Object.keys(groupedContacts).sort().forEach(letter => {
            const group = document.createElement('div');
            group.className = 'contact-group';
            group.dataset.letter = letter;
            
            const header = document.createElement('div');
            header.className = 'group-header';
            header.textContent = letter;
            group.appendChild(header);
            
            groupedContacts[letter].forEach(contact => {
                const contactElement = this.createContactElement(contact);
                group.appendChild(contactElement);
            });
            
            this.contactsList.appendChild(group);
        });
    }
    
    groupContactsByLetter(contacts) {
        const grouped = {};
        
        contacts.forEach(contact => {
            const firstLetter = contact.firstName.charAt(0).toUpperCase();
            const letter = firstLetter.match(/[A-Z]/) ? firstLetter : '#';
            
            if (!grouped[letter]) {
                grouped[letter] = [];
            }
            grouped[letter].push(contact);
        });
        
        Object.keys(grouped).forEach(letter => {
            grouped[letter].sort((a, b) => a.firstName.localeCompare(b.firstName));
        });
        
        return grouped;
    }
    
    createContactElement(contact) {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.dataset.contactId = contact.id;
        
        const initials = this.getInitials(contact.firstName, contact.lastName);
        const avatarColor = this.getAvatarColor(contact.id);
        
        contactItem.innerHTML = `
            <div class="contact-avatar" style="background-color: ${avatarColor}">
                ${initials}
            </div>
            <div class="contact-info">
                <h3>${contact.firstName} ${contact.lastName}</h3>
                <p>${contact.company || contact.phone}</p>
            </div>
        `;
        
        contactItem.addEventListener('click', () => this.showContactDetail(contact));
        
        return contactItem;
    }
    
    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return (first + last).toUpperCase();
    }
    
    getAvatarColor(id) {
        const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D92', '#5AC8FA', '#FFCC00'];
        return colors[id % colors.length];
    }
    
    openAddModal() {
        this.currentEditingId = null;
        this.modalTitle.textContent = 'Nuevo Contacto';
        this.clearForm();
        this.contactModal.classList.add('active');
        this.firstName.focus();
    }
    
    openEditModal(contact) {
        this.currentEditingId = contact.id;
        this.modalTitle.textContent = 'Editar Contacto';
        this.fillForm(contact);
        this.detailModal.classList.remove('active');
        this.contactModal.classList.add('active');
        this.firstName.focus();
    }
    
    closeModal() {
        this.contactModal.classList.remove('active');
        this.clearForm();
    }
    
    closeDetailModal() {
        this.detailModal.classList.remove('active');
    }
    
    clearForm() {
        this.firstName.value = '';
        this.lastName.value = '';
        this.phone.value = '';
        this.email.value = '';
        this.company.value = '';
    }
    
    fillForm(contact) {
        this.firstName.value = contact.firstName || '';
        this.lastName.value = contact.lastName || '';
        this.phone.value = contact.phone || '';
        this.email.value = contact.email || '';
        this.company.value = contact.company || '';
    }
    
    saveContact() {
        const firstName = this.firstName.value.trim();
        const lastName = this.lastName.value.trim();
        const phone = this.phone.value.trim();
        const email = this.email.value.trim();
        const company = this.company.value.trim();
        
        if (!firstName) {
            alert('El nombre es obligatorio');
            this.firstName.focus();
            return;
        }
        
        if (!phone && !email) {
            alert('Debe proporcionar al menos un teléfono o email');
            return;
        }
        
        const contactData = { firstName, lastName, phone, email, company };
        
        if (this.currentEditingId === null) {
            // Nuevo contacto
            contactData.id = this.contacts.length ? Math.max(...this.contacts.map(c => c.id)) + 1 : 1;
            this.contacts.push(contactData);
        } else {
            // Editar existente
            const index = this.contacts.findIndex(c => c.id === this.currentEditingId);
            if (index !== -1) {
                contactData.id = this.currentEditingId;
                this.contacts[index] = contactData;
            }
        }
        
        this.renderContacts();
        this.closeModal();
    }
    
    showContactDetail(contact) {
        this.currentEditingId = contact.id;
        this.detailName.textContent = `${contact.firstName} ${contact.lastName}`;
        this.detailPhone.textContent = contact.phone || '';
        this.detailEmail.textContent = contact.email || '';
        this.detailCompany.textContent = contact.company || '';
        
        const initials = this.getInitials(contact.firstName, contact.lastName);
        this.detailInitials.textContent = initials;
        this.detailPhoto.style.backgroundColor = this.getAvatarColor(contact.id);
        
        this.contactModal.classList.remove('active');
        this.detailModal.classList.add('active');
    }
    
    editCurrentContact() {
        const contact = this.contacts.find(c => c.id === this.currentEditingId);
        if (contact) {
            this.openEditModal(contact);
        }
    }
    
    deleteCurrentContact() {
        if (confirm('¿Quieres eliminar este contacto?')) {
            this.contacts = this.contacts.filter(c => c.id !== this.currentEditingId);
            this.renderContacts();
            this.closeDetailModal();
        }
    }
    
    searchContacts(query) {
        query = query.toLowerCase();
        const filtered = this.contacts.filter(c => {
            return (
                c.firstName.toLowerCase().includes(query) ||
                c.lastName.toLowerCase().includes(query) ||
                (c.company && c.company.toLowerCase().includes(query)) ||
                (c.phone && c.phone.includes(query)) ||
                (c.email && c.email.toLowerCase().includes(query))
            );
        });
        this.renderContacts(filtered);
    }
    
    scrollToLetter(letter) {
        const group = this.contactsList.querySelector(`.contact-group[data-letter="${letter}"]`);
        if (group) {
            group.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    formatPhone(e) {
        // Opcional: agregar formato al teléfono, por ejemplo quitar caracteres no numéricos excepto +
        let val = e.target.value;
        val = val.replace(/[^\d+]/g, '');
        e.target.value = val;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new ContactsApp();
});
