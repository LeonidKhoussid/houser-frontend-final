import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
} from "@mui/material";

const typeOptions = ["House", "Apartment", "Condo"];
const tagOptions = ["Pool", "Garage", "Garden", "Pet Friendly"];

export const FilterModal = ({ open, onClose, onApply }) => {
  const [localFilters, setLocalFilters] = useState({
    type: "",
    country: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
  });

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Filter Properties</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Type"
          select
          fullWidth
          margin="normal"
          value={localFilters.type}
          onChange={(e) => handleChange("type", e.target.value)}>
          {typeOptions.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Country"
          fullWidth
          margin="normal"
          value={localFilters.country}
          onChange={(e) => handleChange("country", e.target.value)}
        />
        <TextField
          label="City"
          fullWidth
          margin="normal"
          value={localFilters.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />

        <TextField
          label="Min Price"
          type="number"
          fullWidth
          margin="normal"
          value={localFilters.minPrice}
          onChange={(e) => handleChange("minPrice", e.target.value)}
        />
        <TextField
          label="Max Price"
          type="number"
          fullWidth
          margin="normal"
          value={localFilters.maxPrice}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
        />

        <TextField
          label="Tags"
          select
          SelectProps={{
            multiple: true,
            renderValue: (selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            ),
          }}
          fullWidth
          margin="normal"
          value={localFilters.tags}
          onChange={(e) => handleChange("tags", e.target.value)}>
          {tagOptions.map((tag) => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};
