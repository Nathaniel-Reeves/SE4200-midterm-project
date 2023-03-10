

const app = Vue.createApp({
    data() {
        return {
            level_of_complexity_judge_input:1,
            uniquness_judge_input:1,
            commercial_viability_judge_input:1,
            aethetics_judge_input:1,
            completeness_judge_input:1,
            session_details: {
                _id: '',
                first_name: '',
                last_name: '',
                email: '',
                logged_in: false,
                contestant: false,
                judge: false,
                attendant: false,
                admin: false
            },
            register_first_name: "",
            register_last_name: "",
            register_email: "",
            register_password: "",
            register_password_confirmation: "",
            validation_errors: [
            ],
            success_messages: [],
            origin: window.location.origin,
            email: '',
            password: '',
            active_view: "Home",
            catagory_filter_select: "all",
            teams: [],
            nav_items: [],
            default_nav_items: [
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
            ],
            team_selected: {}
        }
    },
    methods: {
        create_spider_chart: function () {
            const ctx = document.getElementById('myChart');

            const data = {
                    labels: [
                        'Eating',
                        'Drinking',
                        'Sleeping',
                        'Designing',
                        'Coding',
                        'Cycling',
                        'Running'
                    ],
                    datasets: [{
                        label: 'My First Dataset',
                        data: [65, 59, 90, 81, 56, 55, 40],
                        fill: true,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgb(255, 99, 132)',
                        pointBackgroundColor: 'rgb(255, 99, 132)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(255, 99, 132)'
                    }, {
                        label: 'My Second Dataset',
                        data: [28, 48, 40, 19, 96, 27, 100],
                        fill: true,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        pointBackgroundColor: 'rgb(54, 162, 235)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(54, 162, 235)'
                    }]
                    };

            new Chart(ctx, {
                type:'radar',
                data: data,
                options: {
                    elements: {
                        line: {
                            borderWidth:3
                        }
                    }
                }
            });
        },
        submit_score: function () {
            this.validation_errors = [];
            this.success_messages = [];
            var data = {
                "uniqueness_score" : this.uniquness_judge_input,
                "commercial_viability_score" : this.commercial_viability_judge_input,
                "aethetic_score" : this.aethetics_judge_input,
                "completeness_score" : this.completeness_judge_input,
                "level_of_complexity_score" : this.level_of_complexity_judge_input,
                "criticisms": [],
                "acclaims": []
            }
            fetch(this.origin + '/teams/' + this.team_selected._id + '/judge_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => {
                console.log(response);
                if (response.status === 201) {
                    response.json().then(data => {
                        this.success_messages = data;
                    });
                    this.get_teams("all");
                } else {
                    response.json().then(data => {
                        this.validation_errors = data;
                    });
                }
            });
        },
        select_judgement: function (team) {
            this.validation_errors = [];
            this.success_messages = [];
            var judgement = {};
            for (i in team.judge_scores) {
                if (team.judge_scores[i].judgeId == this.session_details._id) {
                    judgement = team.judge_scores[i];
                    found = true;
                    break;
                }
            }
            if (found) {
                this.level_of_complexity_judge_input = judgement.level_of_complexity_score;
                this.uniquness_judge_input = judgement.uniqueness_score;
                this.commercial_viability_judge_input = judgement.commercial_viability_score;
                this.aethetics_judge_input = judgement.aethetic_score;
                this.completeness_judge_input = judgement.completeness_score;
            } else {
                this.level_of_complexity_judge_input = 1;
                this.uniquness_judge_input = 1;
                this.commercial_viability_judge_input = 1;
                this.aethetics_judge_input = 1;
                this.completeness_judge_input = 1;
            }

        },
        edit_judgement: function () {
            this.validation_errors = [];
            this.success_messages = [];
            var data = data = {
                "uniqueness_score" : this.uniquness_judge_input,
                "commercial_viability_score" : this.commercial_viability_judge_input,
                "aethetic_score" : this.aethetics_judge_input,
                "completeness_score" : this.completeness_judge_input,
                "level_of_complexity_score" : this.level_of_complexity_judge_input,
                "criticisms": [],
                "acclaims": []
            }
            fetch(this.origin + '/teams/' + this.team_selected._id + '/judge_score', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => {
                console.log(response);
                if (response.status === 201) {
                    response.json().then(data => {
                        this.success_messages = data;
                    });
                    this.get_teams("all");
                } else {
                    response.json().then(data => {
                        this.validation_errors = data;
                    });
                }
            });
        },
        delete_judgement: function () {
            this.validation_errors = [];
            this.success_messages = [];
            fetch(this.origin + '/teams/' + this.team_selected._id + '/judge_score', {
                method: 'DELETE'
            }).then(response => {
                console.log(response);
                if (response.status === 200) {
                    response.json().then(data => {
                        this.success_messages = data;
                    });
                    this.get_teams("all");
                    this.change_view("Teams");
                } else {
                    response.json().then(data => {
                        this.validation_errors = data;
                    });
                }
            });
        },
        select_team: function (team) {
            this.validation_errors = [];
            this.success_messages = [];
            console.log("Select Team: " + team);

            function format_string(str) {
                var new_str = str.toLowerCase()
                    .split('_')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' ');
                return new_str;
            }
            team.catagory = format_string(team.catagory);
            team.team_division = format_string(team.team_division);

            var total_criticisms = [];
            var total_acclaims = [];

            var total_level_of_complexity_score = 0;
            var total_uniqueness_score = 0;
            var total_commercial_viability_score = 0;
            var total_aethetic_score = 0;
            var total_completeness_score = 0;
            for (i in team.judge_scores) {
                console.log(i);
                for (j in team.judge_scores[i].criticisms) {
                    total_criticisms.push(team.judge_scores[i].criticisms[j]);
                }
                for (j in team.judge_scores[i].acclaims) {
                    total_acclaims.push(team.judge_scores[i].acclaims[j]);
                }
                total_level_of_complexity_score += team.judge_scores[i].level_of_complexity_score;

                total_uniqueness_score += team.judge_scores[i].uniqueness_score;

                total_commercial_viability_score += team.judge_scores[i].commercial_viability_score;

                total_aethetic_score += team.judge_scores[i].aethetic_score;

                total_completeness_score += team.judge_scores[i].completeness_score;
                
            }
            this.team_selected = team;

            var data = []

            data.push((total_level_of_complexity_score  / (team.judge_scores.length * 5)).toPrecision(2));

            data.push((total_uniqueness_score  / (team.judge_scores.length * 5)).toPrecision(2));

            data.push((total_commercial_viability_score  / (team.judge_scores.length * 5)).toPrecision(2));

            data.push((total_aethetic_score  / (team.judge_scores.length * 5)).toPrecision(2));

            data.push((total_completeness_score / (team.judge_scores.length * 5)).toPrecision(2));

            var labels = [
                "Level of Complexity",
                "Uniqueness",
                "Commercial Viability",
                "Aethetic",
                "Completeness"
            ]

            var chart_data = {
                labels: labels,
                datasents: [
                    {
                        label: "Radio Chart Breakdown of Skills",
                        data: data,
                        fill: true,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        pointBackgroundColor: 'rgb(54, 162, 235)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(54, 162, 235)'

                    }
                ]
            }
            
            this.team_selected.chart_data = chart_data;
            this.team_selected.total_acclaims = total_acclaims;
            this.team_selected.total_criticisms = total_criticisms;

            
        },
        login: function () {
            this.validation_errors = [];
            this.success_messages = [];
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
                console.log(response);
                if (response.status == 200) {
                    response.json().then(data => {
                        this.session_details = data;
                        this.session_details.logged_in = true;
                        this.email = "";
                        this.password = "";
                        this.logged_in_menus();
                        console.log(this.session_details);
                        this.get_teams("all");
                        this.change_view('Home');
                    });
                } else {
                    response.json().then(data => {
                        console.log(data);
                        this.validation_errors = data;
                    });
                }
            }).catch(error => {
                response.json().then(data => {
                    console.log(data);
                    this.validation_errors = data;
                });
            });
        },
        logout: function () {
            this.validation_errors = [];
            this.success_messages = [];
            fetch(window.location.origin + "/logout", {
                method: 'GET'
            }).then(response => {
                if (response.status == 200) {
                    this.session_details = {
                        _id: "",
                        first_name: '',
                        last_name: '',
                        email: '',
                        logged_in: false,
                        contestant: false,
                        judge: false,
                        attendant: false,
                        admin: false
                    }
                    this.get_teams("all");
                    this.nav_items = this.default_nav_items;
                } else {
                    response.json().then(data => {
                        console.log(data);
                        this.validation_errors = data;
                    });
                }
            }).catch(error => {
                response.json().then(data => {
                    console.log(data);
                    this.validation_errors = data;
                });
            });
        },
        register: function () {
            this.validation_errors = [];
            this.success_messages = [];
            if (this.register_password!= this.register_password_confirmation) {
                this.validation_errors.push({
                    message: "Passwords do not match, Please try again!",
                    "status": "error"
                });
            } else {
                fetch(window.location.origin + "/register", {
                    method: 'POST',
                    body: JSON.stringify({
                        first_name: this.register_first_name,
                        last_name: this.register_last_name,
                        email: this.register_email,
                        password: this.register_password,
                        password_confirmation: this.register_password_confirmation
                        }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.status == 201) {
                        this.success_messages.push({
                            status: "ok",
                            message: "New Account Created!  Please login to continue!"
                        });
                        this.register_first_name = "";
                        this.register_last_name = "";
                        this.register_email = "";
                        this.register_password = "";
                        this.register_password_confirmation = "";
                    } else {
                        response.json().then(data => {
                            console.log(data);
                            this.validation_errors = data;
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    response.json().then(data => {
                        console.log(data);
                        this.validation_errors = data;
                    });
                });
            }
        },
        check_judgement_on_team: function(team) {
            if (!this.session_details.judge) {
                return false;
            }
            // get judge ids on team
            var judge_ids = [];
            for (i in team.judge_scores) (
                judge_ids.push(team.judge_scores[i].judgeId)
            );

            return judge_ids.includes(this.session_details._id);
        },
        change_view: function (view) {
            this.active_view = view;
            for (i in this.nav_items) {
                this.nav_items[i].active = false;
                if (this.nav_items[i].name == view) {
                    this.nav_items[i].active = true;
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
                            console.log("DATA: ", data);
                            this.teams = data;
                            for (i in this.teams) {
                                this.teams[i].judged = this.check_judgement_on_team(this.teams[i]);
                            }
                            console.log("CHECKED: ", this.teams);
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
                            console.log("DATA: ", data);
                            this.teams = data;
                            for (i in this.teams) {
                                this.teams[i].judged = this.check_judgement_on_team(this.teams[i]);
                            }
                            console.log("CHECKED: ", this.teams);
                        });
                    }
                });
            }
        },
        logged_in_menus: function() {
            if (this.session_details.admin) {
                this.nav_items.push({
                    name: 'Admin Console',
                    active: false,
                    image:'static/images/image_placeholder.png',
                    caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                })
            }
            // if (this.session_details.judge) {
            //     this.nav_items.push({
            //         name: 'Judge a Team',
            //         active: false,
            //         image:'static/images/image_placeholder.png',
            //         caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            //     });
            // }
            // if (this.session_details.attendant) {
            //     this.nav_items.push({
            //         name: 'Edit Team',
            //         active: false,
            //         image:'static/images/image_placeholder.png',
            //         caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            //     });
            // }
            // if (this.session_details.contestant) {
            //     this.nav_items.push({
            //         name: 'View Team',
            //         active: false,
            //         image:'static/images/image_placeholder.png',
            //         caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            //     });
            // }
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
        }
    },
    created: function () {
        this.get_teams("all");
        this.nav_items = this.default_nav_items;
        this.logged_in_menus();
    }
}).mount('#app');