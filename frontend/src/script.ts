const API_URL = 'https://your-api-gateway-url.amazonaws.com/prod'; // Replace with your actual API URL

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;
    const message = document.getElementById('message') as HTMLParagraphElement;
    const regMessage = document.getElementById('regMessage') as HTMLParagraphElement;
    const registerBtn = document.getElementById('registerBtn') as HTMLAnchorElement;
    const loginBtn = document.getElementById('loginBtn') as HTMLAnchorElement;
    const loginContainer = document.querySelector('.login-container') as HTMLDivElement;
    const registerContainer = document.querySelector('.register-container') as HTMLDivElement;

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = 'Login successful!';
                message.style.color = 'green';
                // Redirect or perform other actions on successful login
            } else {
                message.textContent = data.message || 'Login failed';
                message.style.color = 'red';
            }
        } catch (error) {
            message.textContent = 'An error occurred during login';
            }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('regEmail') as HTMLInputElement).value;
        const password = (document.getElementById('regPassword') as HTMLInputElement).value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                regMessage.textContent = 'Registration successful! Please login.';
                regMessage.style.color = 'green';
                registerContainer.classList.add('hidden');
                loginContainer.classList.remove('hidden');
            } else {
                regMessage.textContent = data.message || 'Registration failed';
                regMessage.style.color = 'red';
            }
        } catch (error) {
            regMessage.textContent = 'An error occurred during registration';
        }
    });
});