Vue.createApp({
    data() {
        return {
            session_details: {
                first_name: '',
                last_name: '',
                email: '',
                logged_in: false,
                contestant: false,
                judge: false,
                attendant: false,
                admin: false

            },
            validation_errors: [
            ],
            origin: window.location.origin,
            email: '',
            password: '',
            active_view: "Home",
            catagory_filter_select: "all",
            teams: [],
            nav_items: [
                {
                    name: 'Home',
                    active: true,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                },
                {
                    name: 'Teams',
                    active: false,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                },
                {
                    name: 'Rankings',
                    active: false,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                },
                {
                    name: 'Prizes',
                    active: false,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                },
                {
                    name: 'Venu',
                    active: false,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                },
                {
                    name: 'Rubric',
                    active: false,
                    image: 'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                }
            ]
        }
    },
    methods: {
        login: function () {
            this.validation_errors = [];
            fetch(window.location.origin + "/login", {
                method: 'POST',
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.status == 200) {
                    response.json().then(data => {
                        this.session_details = data;
                        this.session_details.logged_in = true;
                        this.change_view("Home");
                    });
                } else if(response.status = 401) {
                    this.validation_errors.push({
                        key: "Wrong Password",
                        message: "Try again!"
                    });
                } else {
                    this.validation_errors.push({
                        key: "User Doesn't Exist",
                        message: "Would you like to register a new account?"
                    });
                }
            });
        },
        logout: function () {
            fetch(window.location.origin + "/logout", {
                method: 'GET'
            }).then(response => {
                if (response.status == 200) {
                    this.session_details = {
                        first_name: '',
                        last_name: '',
                        email: '',
                        logged_in: false,
                        contestant: false,
                        judge: false,
                        attendant: false,
                        admin: false
                    }
                } else {
                    console.log(response);
                }
            }).catch(error => {
                console.log(error);
            });
        },
        change_view: function (view) {
            this.active_view = view;
            for (nav_item in this.nav_items) {
                nav_item.active = false;
                if (nav_item.name == view) {
                    nav_item.active = true;
                }
            }
        },
        get_teams: function (filter) {
            if (filter == "all") {
                fetch(window.location.origin + "/teams", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.status == 200) {
                        response.json().then(data => {
                            console.log(data);
                            this.teams = data;
                        });
                    }
                });
            } else {
                fetch(window.location.origin + "/teams?catagory=" + filter, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.status == 200) {
                        response.json().then(data => {
                            console.log(data);
                            this.teams = data;
                        });
                    }
                });
            }
        }
    },
    computed: {
        filter_catagory: function () {
            var vm = this;
            var catagory = vm.catagory_filter_select;

            if (catagory == "all") {
                return vm.teams;
            } else {
                return vm.teams.filter(function (team) {
                    return team.catagory == catagory;
                });
            }
        },
        admin_logged_in: function() {
            if (this.session_details.admin) {
                this.nav_items.push({
                    name: 'Admin Console',
                    active: false,
                    image:'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                })
            }
        },
        judge_logged_in: function() {
            if (this.session_details.judge) {
                this.nav_items.push({
                    name: 'Judge a Team',
                    active: false,
                    image:'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                });
            }
        },
        attendant_logged_in: function() {
            if (this.session_details.attendant) {
                this.nav_items.push({
                    name: 'Edit Team',
                    active: false,
                    image:'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                });
            }
        },
        contestant_logged_in: function() {
            if (this.session_details.contestant) {
                this.nav_items.push({
                    name: 'View Team',
                    active: false,
                    image:'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                });
            }
        }
    },
    created: function () {
        this.get_teams("all");
    }
}).mount('#app')