import React from 'react';
import Login from './Login.jsx';
import AuthService from '../config/AuthService.js'
import {Button} from 'react-bootstrap'
import Nav from './Nav.jsx';
import ProjectList from './ProjectList.jsx';
import Project from './ProjectView.jsx';
import Search from './Search.jsx';
import ChatApp from './chatRoom.jsx';
import repoService from '../config/services';
import UserRepos from './UserRepos.jsx';


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { projects: props.repod.getProjects(), currentProject: null, profile: props.auth.getProfile() }

    props.auth.on('profile_updated', (newProfile) => {
      this.setState({profile: newProfile})
      props.repod.getthem();

      //this.repod = new repoService();
    })
    props.repod.on('list_updated', (items) => {
      this.setState({projects: items})//.bind(this)
      //this.addNewProject('assignment_jq_ee_sprint');
    })
    props.auth.on('logged_out', (bye) => {
      this.setState({profile: this.props.auth.getProfile()})
      //this.render();
    })

  }

  refreshProjectList() { //bind this to button if we want a refresh button,
    this.props.repod.getthem();
  }

  addNewProject(newProjectName) { // assign this to add project click event with the repo name as newProjectName argument
    this.props.repod.addOne(newProjectName);
  }

  handleProjectListEntryClick(project) {
    // setState is async so the render will fire before the currentProject is changed
    // this forces the state to wait until it is updated to rerender
    if (project !== null) {
      var context = this;
      axios.get('/api/deliverables?id=' + project.id)
      .then(function(response) {
        project.currSprint = [];
        project.backlog = [];
        project.ready = [];
        project.icebox = [];
        project.done = [];
        response.data.forEach(function(deliverable) {
          if (deliverable.status === 'Done') {
            project.done.push(deliverable);
          } else if (deliverable.status === 'Backlog') {
            project.backlog.push(deliverable);
          } else if (deliverable.status === 'Ready') {
            project.ready.push(deliverable);
          } else if (deliverable.status === 'In Progress') {
            project.currSprint.push(deliverable);
          }
        });
        context.state.currentProject = project;
        context.forceUpdate();
      });
    } else {
      this.setState({currentProject: project});
    }
  }

  getGitHubProjects(query) {

    var options = {
      key: '',
      query: query
    };

    this.props.searchGitHub()
  }
  logout(){
    this.props.auth.logout()//add props.auth.on('logged-out') event which should be triggered in authservice.js which refreshes page. and same for logged in or authenticated events rather than the use of routes in authservice and here.
    //this.context.router.push('/login');//
  }


  render() {
    const { profile } = this.state
    const { auth } = this.props
    //const requireAuth = (nextState, replace) => {
      if (!auth.loggedIn()) {
       //replace({ pathname: '/login' })
       return (
        <div>
          <Login auth={auth}/>
        </div>
        )
      // }
     } else {
      if (this.state.currentProject === null) {

        return (
          <div>
            <Nav profile={profile} logout={this.logout.bind(this)} handleProjectListEntryClick={this.handleProjectListEntryClick.bind(this)} />
            <Search projects={this.state.projects} handleProjectListEntryClick={this.handleProjectListEntryClick.bind(this)} />
            <UserRepos />
          </div>
        );
      } else {
        return (
          <div>

            <Nav profile={profile} logout={this.logout.bind(this)} handleProjectListEntryClick={this.handleProjectListEntryClick.bind(this)} />
            <Project project={this.state.currentProject} profile={this.state.profile} />
          </div>
        );
      }
    }
  }
}

module.exports = App;