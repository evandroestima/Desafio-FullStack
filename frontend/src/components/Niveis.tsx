import React, { useState, useEffect, useMemo } from "react";
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
  TableSortLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../api";
// You may need to define API_URL and Nivel type if not already defined elsewhere
// Example:
type Nivel = { id: number; nivel: string; developerCount?: number };

// Helper function to create a comparator for sorting
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Helper function to get the correct comparator based on the sort order
type Order = "asc" | "desc";
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// A more stable sorting function
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const NiveisPage = () => {
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Nivel | null>(null);
  const [nivelInput, setNivelInput] = useState("");

  // New state for sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Nivel>("nivel");

  // Fetch data from the backend
  const fetchNiveis = async () => {
    try {
      const response = await fetch(`${API_URL}/niveis`);
      const data = await response.json();
      console.log("Níveis fetched:", data);
      setNiveis(data);
    } catch (error) {
      console.error("Erro ao buscar níveis:", error);
    }
  };

  // Handler for sorting requests
  const handleRequestSort = (property: keyof Nivel) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // A memoized sorted list to prevent unnecessary re-renders
  const sortedNiveis = useMemo(() => {
    return stableSort(niveis, getComparator(order, orderBy));
  }, [niveis, order, orderBy]);

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
    alert("Nível excluído com sucesso!");
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
      alert("Nível salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar nível:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentLevel) return;
    try {
      const response = await fetch(`${API_URL}/niveis/${currentLevel.id}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        alert(
          "Este nível tem desenvolvedores associados e não pode ser deletado."
        );

        console.error(
          "Este nível tem desenvolvedores associados e não pode ser deletado."
        );
        handleCloseConfirm();
        return;
      }

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
              <TableCell sortDirection={orderBy === "id" ? order : false}>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleRequestSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "nivel" ? order : false}>
                <TableSortLabel
                  active={orderBy === "nivel"}
                  direction={orderBy === "nivel" ? order : "asc"}
                  onClick={() => handleRequestSort("nivel")}
                >
                  Nível
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "developerCount"}
                  direction={orderBy === "developerCount" ? order : "asc"}
                  onClick={() => handleRequestSort("developerCount")}
                >
                  Qtd de Desenvolvedores associados
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedNiveis.length > 0 ? (
              sortedNiveis.map((nivel) => {
                const nivelObj: Nivel = {
                  id:
                    typeof nivel.id === "string"
                      ? parseInt(nivel.id, 10)
                      : nivel.id,
                  nivel:
                    typeof nivel.nivel === "number"
                      ? String(nivel.nivel)
                      : nivel.nivel,
                  developerCount:
                    typeof nivel.developerCount === "string"
                      ? parseInt(nivel.developerCount, 10)
                      : nivel.developerCount,
                };
                return (
                  <TableRow key={nivelObj.id}>
                    <TableCell>{nivelObj.id}</TableCell>
                    <TableCell>{nivelObj.nivel}</TableCell>
                    <TableCell>{nivelObj.developerCount ?? 0}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenModal(nivelObj)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenConfirm(nivelObj)}
                        color="secondary"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
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
