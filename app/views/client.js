Vue.createApp({
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        login: function () {
            console.log(this.email, this.password);
            fetch("http://localhost:8080/login", {
                method: 'POST',
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                console.log(response.status);
            });
        }
    },
    created: function () {
    }
}).mount('#app')