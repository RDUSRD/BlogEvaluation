// Funcion para obtener las publicaciones de un usuario
async function getPosts() {
  const usuario_id = localStorage.getItem("usuario_id");

  try {
    const response = await fetch(`${urlApi}publicaciones/${usuario_id}`);

    const data = await response.json();

    const postsContainer = document.getElementById("myPosts");

    postsContainer.innerHTML = "";

    if (data.length === 0) {
      postsContainer.innerHTML = "<h5>No hay publicaciones</h5>";
    } else {
      data.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.className = "card mb-4";
        postElement.id = `post-${post.id}`;

        postElement.innerHTML = `
        <img src="${post.url_imagen}" class="card-img-top" alt="${post.titulo}">
        <div class="card-body">
          <h5 class="card-title">${post.titulo}</h5>
          <p class="card-text">${post.descripcion}</p>
          <div class="buttonsclass">
          <button class="btn btn-primary" onclick="editPost(${post.id})">Editar</button>
          <button class="btn btn-danger" onclick="confirmDelete(${post.id})">Borrar</button>
          </div>
        </div>
    `;

        postsContainer.appendChild(postElement);
      });
    }
  } catch (error) {
    console.error("Error en la solicitud de publicaciones", error);
  }
}

// Funcion para obtener las publicaciones de todos los usuarios
async function getAllPosts() {
  try {
    const response = await fetch(`${urlApi}publicaciones`);
    const posts = await response.json();

    const postsContainer = document.getElementById("generalPosts");
    postsContainer.innerHTML = "";

    if (posts.length === 0) {
      postsContainer.innerHTML = "<h5>No hay publicaciones</h5>";
    } else {
      for (const post of posts) {
        const userResponse = await fetch(
          `${urlApi}usuarios/${post.usuario_id}`
        );
        const user = await userResponse.json();

        const postElement = document.createElement("div");
        postElement.className = "card mb-4";
        postElement.id = `post-${post.id}`;

        postElement.innerHTML = `
          <img src="${post.url_imagen}" class="card-img-top post-image" alt="${post.titulo}">
          <div class="card-body">
            <h5 class="card-title">${post.titulo}</h5>
            <p class="card-text">${post.descripcion}</p>
            <p class="card-text">Posted by ${user.nombre}</p>
          </div>
        `;

        postsContainer.appendChild(postElement);
      }
    }
  } catch (error) {
    console.error("Error en la solicitud de publicaciones", error);
  }
}

// Función para editar una publicación
async function editPost(postId) {
  const postElement = document.getElementById(`post-${postId}`);
  const imgElement = postElement.querySelector(".card-img-top");
  const titleElement = postElement.querySelector(".card-title");
  const descriptionElement = postElement.querySelector(".card-text");
  const editButton = postElement.querySelector(".btn-primary");

  const imgUrl = imgElement.getAttribute("src");
  const title = titleElement.textContent;
  const description = descriptionElement.textContent;

  imgElement.outerHTML = `<input type="text" id="edit-img-${postId}" value="${imgUrl}">`;
  titleElement.innerHTML = `<input type="text" id="edit-title-${postId}" value="${title}">`;
  descriptionElement.innerHTML = `<input type="text" id="edit-description-${postId}" value="${description}">`;

  editButton.textContent = "Aceptar";
  editButton.onclick = async function () {
    const newImgUrl = document.getElementById(`edit-img-${postId}`).value;
    const newTitle = document.getElementById(`edit-title-${postId}`).value;
    const newDescription = document.getElementById(
      `edit-description-${postId}`
    ).value;

    try {
      const response = await fetch(`${urlApi}publicaciones/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url_imagen: newImgUrl,
          titulo: newTitle,
          descripcion: newDescription,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        const newImgElement = document.createElement("img");
        newImgElement.setAttribute("src", newImgUrl);
        newImgElement.setAttribute("class", "card-img-top");
        document
          .getElementById(`edit-img-${postId}`)
          .replaceWith(newImgElement);

        titleElement.textContent = newTitle;
        descriptionElement.textContent = newDescription;

        editButton.textContent = "Editar";
        editButton.onclick = function () {
          editPost(postId);
        };
      } else {
        console.error("Error al actualizar el post:", data.message);
      }
    } catch (error) {
      console.error("Error al actualizar el post:", error);
    }
  };
}

// Función para crear una publicación
async function createPost() {
  const titulo = document.getElementById("postTitle").value;
  const descripcion = document.getElementById("postDescription").value;
  const url_imagen = document.getElementById("postImage").value;

  // Validar que los campos no estén vacíos
  if (!titulo || !descripcion || !url_imagen) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const usuario_id = localStorage.getItem("usuario_id");

    const response = await fetch(`${urlApi}publicaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titulo, descripcion, url_imagen, usuario_id }),
    });

    const data = await response.json();

    // Puedes manejar la respuesta según tus necesidades
    console.log(data);

    // Limpiar los campos del formulario después de crear la publicación
    document.getElementById("postTitle").value = "";
    document.getElementById("postDescription").value = "";
    document.getElementById("postImage").value = "";

    // Alerta de exito
    alert("Publicación creada exitosamente");

    // Actualizar la lista de publicaciones
    getPosts();

    // redirigir a la pagina de home
    window.location.href = "home.html";
  } catch (error) {
    console.error("Error en la solicitud de creación de publicación", error);
  }
}

// Función para eliminar una publicación
async function deletePost(postId) {
  try {
    const response = await fetch(`${urlApi}publicaciones/${postId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    console.log(data);

    if (response.ok) {
      const postElement = document.getElementById(`post-${postId}`);
      postElement.remove();
    } else {
      console.error("Error al eliminar el post:", data.message);
    }
  } catch (error) {
    console.error("Error al eliminar el post:", error);
  }
}

// Funcion para editar perfil de usuario
async function editProfile() {
  const nombre = document.getElementById("editName").value;
  const contraseña = document.getElementById("editPassword").value;
  const confirmPassword = document.getElementById("editConfirmPassword").value;

  if (!nombre || !contraseña || !confirmPassword) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  if (contraseña !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (
    !confirm("¿Estás seguro de que quieres actualizar tus datos de sesión?")
  ) {
    return;
  }

  try {
    const usuario_id = localStorage.getItem("usuario_id");

    const response = await fetch(`${urlApi}perfil/${usuario_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, contraseña }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Data:", data);

    document.getElementById("editName").value = "";
    document.getElementById("editPassword").value = "";
    document.getElementById("editConfirmPassword").value = "";

    alert("Perfil actualizado exitosamente");
  } catch (error) {
    console.error("Error en la solicitud de edición de perfil", error);
    alert("Error en la solicitud de edición de perfil: " + error.message);
  }
}

// Funcion para buscar post de alguien en especifico
async function searchPost() {
  const search = document.getElementById("searchTerm").value;

  try {
    // Buscar al usuario por su nombre
    const userResponse = await fetch(`${urlApi}usuarios/nombre/${search}`);
    if (!userResponse.ok) {
      throw new Error(`HTTP error! status: ${userResponse.status}`);
    }

    const users = await userResponse.json();

    if (users.length === 0) {
      alert("Ese usuario no existe.");
      return;
    }

    const postsContainer = document.getElementById("searchResults");
    postsContainer.innerHTML = "";

    for (const user of users) {
      // Buscar las publicaciones por el ID del usuario
      const response = await fetch(`${urlApi}publicaciones/${user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const posts = await response.json();

      for (const post of posts) {
        const postElement = document.createElement("div");
        postElement.className = "card mb-4";
        postElement.id = `post-${post.id}`;

        postElement.innerHTML = `
        <img src="${post.url_imagen}" class="card-img-top post-image" alt="${post.titulo}">
        <div class="card-body">
          <h5 class="card-title">${post.titulo}</h5>
          <p class="card-text">${post.descripcion}</p>
          <p class="card-text">Posted by ${user.nombre}</p>
        </div>
      `;

        postsContainer.appendChild(postElement);
      }
    }
  } catch (error) {
    console.error("Error en la solicitud de publicaciones", error);
  }
}

// Función para cerrar sesión
function logout() {
  // Eliminar el id del usuario del almacenamiento local
  localStorage.removeItem("usuario_id");

  // Redirigir a la página de inicio de sesión
  window.location.href = "index.html";
}

// Funcion para enviar mensaje de bienvenida
function welcomeMessage() {
  const usuario_id = localStorage.getItem("usuario_id");

  fetch(`${urlApi}usuarios/${usuario_id}`)
    .then((response) => response.json())
    .then((data) => {
      // Actualizar el mensaje de bienvenida en el navbar
      document.getElementById(
        "welcomeMessage"
      ).textContent = `Bienvenido ${data.nombre}`;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Funcion para actualizar los inputs de editar perfil
function updateInputs() {
  const usuario_id = localStorage.getItem("usuario_id");

  fetch(`${urlApi}usuarios/${usuario_id}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("editName").value = data.nombre;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Funcion para confirmar el borrado de un post
function confirmDelete(postId) {
  if (confirm("¿Estás seguro de que quieres borrar este post?")) {
    deletePost(postId);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const usuario_id = localStorage.getItem("usuario_id");

  if (!usuario_id) {
    // Alerta para que inicie sesion
    alert("Por favor, inicia sesión para ver esta página.");

    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = "index.html";
  } else {
    // Actualizar el mensaje de bienvenida en el navbar
    welcomeMessage();
    // Verificar si la página actual es home.html
    if (window.location.pathname.endsWith("home.html")) {
      // Cargar la página como de costumbre
      getPosts();
      getAllPosts();
    }
    // Verificar si la página actual es profile.html
    if (window.location.pathname.endsWith("editProfile.html")) {
      // Cargar la página como de costumbre
      updateInputs();
    }
  }
});

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    searchPost();
  });
