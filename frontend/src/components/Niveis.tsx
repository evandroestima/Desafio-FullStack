import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// You may need to define API_URL and Nivel type if not already defined elsewhere
// Example:
const API_URL = "http://localhost:3000";
type Nivel = { id: number; nivel: string };

const NiveisPage = () => {
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Nivel | null>(null);
  const [nivelInput, setNivelInput] = useState("");

  // Fetch data from the backend
  const fetchNiveis = async () => {
    try {
      const response = await fetch(`${API_URL}/niveis`);
      const data = await response.json();
      console.log(data);
      setNiveis(data);
    } catch (error) {
      console.error("Erro ao buscar níveis:", error);
    }
  };

  // Run on component mount
  useEffect(() => {
    fetchNiveis();
  }, []);

  // Handlers for modal actions
  const handleOpenModal = (nivel: Nivel | null = null) => {
    setCurrentLevel(nivel);
    setNivelInput(nivel ? nivel.nivel : "");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentLevel(null);
    setNivelInput("");
  };

  const handleOpenConfirm = (nivel: Nivel) => {
    setCurrentLevel(nivel);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setCurrentLevel(null);
  };

  // CRUD operations
  const handleAddOrEdit = async () => {
    try {
      const payload = { nivel: nivelInput };
      if (currentLevel) {
        // Edit
        await fetch(`${API_URL}/niveis/${currentLevel.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Add
        await fetch(`${API_URL}/niveis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchNiveis(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar nível:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentLevel) return;
    try {
      await fetch(`${API_URL}/niveis/${currentLevel.id}`, {
        method: "DELETE",
      });
      fetchNiveis();
      handleCloseConfirm();
    } catch (error) {
      console.error("Erro ao deletar nível:", error);
    }
  };

  return (
    <div>
      <div
        className="flex justify-between items-center"
        style={styles.pageTitle}
      >
        <Typography variant="h4" component="h1">
          Lista de Níveis
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Adicionar Nível
        </Button>
      </div>

      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-200">
              <TableCell>ID</TableCell>
              <TableCell>Nível</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {niveis.length > 0 ? (
              niveis.map((nivel) => (
                <TableRow key={nivel.id}>
                  <TableCell>{nivel.id}</TableCell>
                  <TableCell>{nivel.nivel}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenModal(nivel)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenConfirm(nivel)}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum nível cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {currentLevel ? "Editar Nível" : "Adicionar Nível"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nível"
            type="text"
            fullWidth
            value={nivelInput}
            onChange={(e) => setNivelInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddOrEdit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja excluir o nível "{currentLevel?.nivel}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NiveisPage;

const styles = {
  title: {
    flexGrow: 1,
  },

  tableContainer: {
    marginBottom: "2rem",
  },
  modal: {
    padding: "1rem",
    borderRadius: "8px",
  },

  pageTitle: {
    marginBottom: "1rem",
  },
  button: {
    margin: "0 0.5rem",
  },
};
