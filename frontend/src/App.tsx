import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

import NiveisPage from "./components/Niveis";
import DesenvolvedoresPage from "./components/Desenvolvedores";

// Styles for Material UI components
const styles = {
  appBar: {
    backgroundColor: "#1976d2",
  },
  title: {
    flexGrow: 1,
  },
  pageContainer: {
    marginTop: "2rem",
  },
  tableContainer: {
    marginBottom: "2rem",
  },
  modal: {
    padding: "1rem",
    borderRadius: "8px",
  },
  formControl: {
    minWidth: 120,
    marginTop: "1rem",
  },
  pageTitle: {
    marginBottom: "1rem",
  },
  button: {
    margin: "0 0.5rem",
  },
};

// A single-file application structure that manages different pages
export default function App() {
  const [currentPage, setCurrentPage] = useState("niveis");

  const renderPage = () => {
    switch (currentPage) {
      case "niveis":
        return <NiveisPage />;
      case "desenvolvedores":
        return <DesenvolvedoresPage />;
      default:
        return <NiveisPage />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      <AppBar position="static" sx={styles.appBar}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={styles.title}>
            Cadastro de Desenvolvedores
          </Typography>
          <Button color="inherit" onClick={() => setCurrentPage("niveis")}>
            Níveis
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentPage("desenvolvedores")}
          >
            Desenvolvedores
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={styles.pageContainer}>
        {renderPage()}
      </Container>
    </div>
  );
}

// Desenvolvedores Page Component
// ----------------------------------------------------
