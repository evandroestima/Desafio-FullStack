# Projeto de Cadastro de Desenvolvedores 🚀

Este projeto consiste em uma aplicação para cadastro de desenvolvedores associados a diferentes níveis. A aplicação é composta por um backend que oferece uma API RESTful e um frontend que é uma SPA (Single Page Application) interligada à API.

# **Como executar o projeto**
Você precisa ter o Docker e o Docker componse instalados na sua máquina. 

1 - Clone o repositório

2 - Execute o seguinte comando para iniciar os contêineres do Docker:
  ```bash
    docker-compose up --build
  ```
3 - O frontend estará disponível em: 
 - http://localhost:5173

4 - O backend estará disponível em:
   - http://localhost:3000

# **Backend** 🚀

Consiste de uma API RESTful com os métodos GET, POST, PUT/PATCH e DELETE.

## Endpoints da API 🚚

### **Níveis**

- **Listar Níveis (GET):** `/api/niveis`

  - **Resposta de Sucesso (200):** Retorna a lista de níveis existentes.

  ```json
  {
    "id": 1,
    "nivel": "Nome do Nível"
  }
  ```

  - **Resposta de Erro (404):** Retorna se não houver nenhum nível cadastrado.

- **Cadastrar Nível (POST):** `/api/niveis`

  - **Corpo da Requisição:**

  ```json
  {
    "nivel": "Nome do Nível"
  }
  ```

  - **Resposta de Sucesso (201):** Retorna o novo nível criado.
  - **Resposta de Erro (400):** Retorna se o corpo da requisição estiver incorreto.

- **Editar Nível (PUT/PATCH):** `/api/niveis/:id`

  - **Corpo da Requisição:**

  ```json
  {
    "nivel": "Nome do Nível"
  }
  ```

  - **Resposta de Sucesso (200):** Retorna o nível editado.
  - **Resposta de Erro (400):** Retorna se o corpo da requisição estiver incorreto.

- **Remover Nível (DELETE):** `/api/niveis/:id`
  - **Resposta de Sucesso (204):** Retorna se o nível foi removido com sucesso.
  - **Resposta de Erro (400):** Retorna se houver desenvolvedores associados ao nível.

### **Desenvolvedores**

- **Listar Desenvolvedores (GET):** `/api/desenvolvedores`

  - **Resposta de Sucesso (200):** Retorna a lista de desenvolvedores existentes.

  ```json
  {
    "id": 1,
    "nome": "Nome do Desenvolvedor",
    "sexo": "M",
    "data_nascimento": "1990-01-01",
    "idade": 31,
    "hobby": "Programação",
    "nivel": {
      "id": 1,
      "nivel": "Nome do Nível"
    }
  }
  ```

  - **Resposta de Erro (404):** Retorna se não houver nenhum desenvolvedor cadastrado.

- **Cadastrar Desenvolvedor (POST):** `/api/desenvolvedores`

  - **Corpo da Requisição:**

  ```json
  {
    "nivel_id": 1,
    "nome": "Nome do Desenvolvedor",
    "sexo": "M",
    "data_nascimento": "1990-01-01",
    "hobby": "Programação"
  }
  ```

  - **Resposta de Sucesso (201):** Retorna o novo desenvolvedor criado.
  - **Resposta de Erro (400):** Retorna se o corpo da requisição estiver incorreto.

- **Editar Desenvolvedor (PUT/PATCH):** `/api/desenvolvedores/:id`

  - **Corpo da Requisição:**

  ```json
  {
    "nome": "Novo Nome do Desenvolvedor",
    "hobby": "Violão",
    "nivel_id": 2,
    "sexo": "F",
    "data_nascimento": "1990-01-01"
  }
  ```

  - **Resposta de Sucesso (200):** Retorna o desenvolvedor editado.
  - **Resposta de Erro (400):** Retorna se o corpo da requisição estiver incorreto.

- **Remover Desenvolvedor (DELETE):** `/api/desenvolvedores/:id`
  - **Resposta de Sucesso (204):** Retorna se o desenvolvedor foi removido com sucesso.
  - **Resposta de Erro (400):** Retorna se houver problemas na remoção.
