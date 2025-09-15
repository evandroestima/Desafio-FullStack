import { useState, useEffect, useMemo } from "react";
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
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { API_URL } from "../api";

type Nivel = { id: number; nivel: string; developerCount: number };

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (
    bValue === undefined ||
    aValue === undefined ||
    bValue === null ||
    aValue === null
  ) {
    return 0;
  }

  if (typeof bValue === "string" && typeof aValue === "string") {
    return bValue.localeCompare(aValue);
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

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
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Nivel>("nivel");
  const [filterText, setFilterText] = useState("");
  const [message, setMessage] = useState({
    open: false,
    text: "",
    type: "success",
  });

  const fetchNiveis = async () => {
    try {
      const response = await fetch(`${API_URL}/niveis`);
      const data = await response.json();
      setNiveis(data);
    } catch (error) {
      console.error("Erro ao buscar níveis:", error);
    }
  };

  const handleRequestSort = (property: keyof Nivel) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedNiveis = useMemo(() => {
    const filteredList = niveis.filter((nivel) =>
      nivel.nivel.toLowerCase().includes(filterText.toLowerCase())
    );
    return stableSort(filteredList, getComparator(order, orderBy));
  }, [niveis, order, orderBy, filterText]);

  useEffect(() => {
    fetchNiveis();
  }, []);

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

  const handleCloseMessage = () => {
    setMessage({ open: false, text: "", type: "success" });
  };

  const handleAddOrEdit = async () => {
    try {
      const payload = { nivel: nivelInput };
      if (currentLevel) {
        const response = await fetch(`${API_URL}/niveis/${currentLevel.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setMessage({
            open: true,
            text: "Nível salvo com sucesso!",
            type: "success",
          });
        } else {
          setMessage({
            open: true,
            text: "Erro ao salvar nível.",
            type: "error",
          });
        }
      } else {
        const response = await fetch(`${API_URL}/niveis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setMessage({
            open: true,
            text: "Nível adicionado com sucesso!",
            type: "success",
          });
        } else {
          setMessage({
            open: true,
            text: "Erro ao adicionar nível.",
            type: "error",
          });
        }
      }
      fetchNiveis(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar nível:", error);
      setMessage({
        open: true,
        text: "Erro ao conectar com a API.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!currentLevel) return;
    try {
      const response = await fetch(`${API_URL}/niveis/${currentLevel.id}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        setMessage({
          open: true,
          text: "Este nível tem desenvolvedores associados e não pode ser deletado.",
          type: "error",
        });
        handleCloseConfirm();
        return;
      }

      if (response.ok) {
        setMessage({
          open: true,
          text: "Nível excluído com sucesso!",
          type: "success",
        });
        fetchNiveis();
      } else {
        setMessage({
          open: true,
          text: "Erro ao deletar nível.",
          type: "error",
        });
      }
      handleCloseConfirm();
    } catch (error) {
      console.error("Erro ao deletar nível:", error);
      setMessage({
        open: true,
        text: "Erro ao conectar com a API.",
        type: "error",
      });
      handleCloseConfirm();
    }
  };

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row justify-between items-center"
        style={styles.pageTitle}
      >
        <Typography variant="h4" component="h1" className="mb-4 sm:mb-0">
          Lista de Níveis
        </Typography>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <TextField
            label="Buscar Nível"
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            className="w-full sm:w-auto"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto"
          >
            Adicionar Nível
          </Button>
        </div>
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
            {filteredAndSortedNiveis.length > 0 ? (
              filteredAndSortedNiveis.map((nivel) => {
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
                    nivel.developerCount === undefined ||
                    nivel.developerCount === null
                      ? 0
                      : typeof nivel.developerCount === "string"
                      ? parseInt(nivel.developerCount, 10)
                      : nivel.developerCount,
                };
                return (
                  <TableRow key={nivelObj.id}>
                    <TableCell>{nivelObj.id}</TableCell>
                    <TableCell>{nivelObj.nivel}</TableCell>
                    <TableCell>{nivelObj.developerCount}</TableCell>
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
                <TableCell colSpan={4} align="center">
                  Nenhum nível encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Dialog open={message.open} onClose={handleCloseMessage}>
        <DialogTitle>
          {message.type === "success" ? "Sucesso" : "Erro"}
        </DialogTitle>
        <DialogContent>
          <Typography>{message.text}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessage} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NiveisPage;

const styles = {
  pageTitle: {
    marginBottom: "1rem",
  },
  tableContainer: {
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};
