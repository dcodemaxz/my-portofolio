function searchProjects() {
  const projectsDiv = document.querySelector('.projects');

  axios('https://bohr.io/api/public/user/projects/' + _BOHR_REPO_OWNER)
    .then((res) => {
      const projects = res.data
      projects.map((project) => {
        const div = document.createElement('div');
        const div2 = document.createElement('div');
        const div3 = document.createElement('div');
        const div4 = document.createElement('div');
        const projectImg = document.createElement('img');
        const projectName = document.createElement('h2');
        const projectFavicon = document.createElement('img');
        const projectUrl = document.createElement('a');
        const projectUrlGithub = document.createElement('a');

        projectImg.setAttribute('src', project.imageUrl);
        projectFavicon.setAttribute('src', project.favicon);
        projectName.innerText = project.name
        projectUrl.innerHTML = '<i class="ph-link-thin"></i>'
        projectUrl.setAttribute('href', project.url)
        projectUrl.setAttribute('target', '_blank')

        projectUrlGithub.innerHTML = '<i class="ph-github-logo"></i>'
        projectUrlGithub.setAttribute('href', project.githubUrl)
        projectUrlGithub.setAttribute('target', '_blank')

        div.className = 'project';
        div2.className = 'project__info';
        div3.className = 'project__info_text';
        div4.className = 'project__links';
        projectFavicon.className = 'project__info_favicon';

        div.appendChild(projectImg);
        div.appendChild(div2);
        div2.appendChild(div3);
        div3.appendChild(projectFavicon);
        div3.appendChild(projectName);
        div3.appendChild(projectUrl);
        div3.appendChild(div4)
        div4.appendChild(projectUrl);
        div4.appendChild(projectUrlGithub);

        projectsDiv.appendChild(div);
      })

    }).catch((err) => {
      console.log(err);
    });
}

function getUserName() {
  axios('https://api.github.com/users/' + _BOHR_REPO_OWNER)
  .then((res) => {
    document.querySelector('.user__infos_text h1').innerText = res.data.name;
  })
}

searchProjects();
getUserName();

document.querySelector('.user__infos_img img').src = 'https://github.com/' + _BOHR_REPO_OWNER + '.png';
