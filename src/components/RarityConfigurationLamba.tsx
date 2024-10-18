import React, { useState } from 'react';
import { Layer, Trait } from '../types';
import { Slider, Accordion, AccordionSummary, AccordionDetails, Typography, Box, TextField, Button, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PieChart } from 'react-minimal-pie-chart';

interface RarityConfigurationLambaProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

const RarityConfigurationLamba: React.FC<RarityConfigurationLambaProps> = ({ layers, setLayers }) => {
  const [expandedLayer, setExpandedLayer] = useState<string | false>(false);
  const [bulkRarity, setBulkRarity] = useState<number>(100);
  const [normalizeDialogOpen, setNormalizeDialogOpen] = useState<string | null>(null);

  const handleRarityChange = (layerId: string, traitIndex: number, newRarity: number) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              traits: layer.traits.map((trait, index) =>
                index === traitIndex ? { ...trait, rarity: newRarity } : trait
              ),
            }
          : layer
      )
    );
  };

  const handleBulkRarityChange = (layerId: string) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              traits: layer.traits.map(trait => ({ ...trait, rarity: bulkRarity })),
            }
          : layer
      )
    );
  };

  const calculateTotalRarity = (traits: Trait[]) => {
    return traits.reduce((sum, trait) => sum + trait.rarity, 0);
  };

  const normalizeRarities = (layerId: string) => {
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          const totalRarity = calculateTotalRarity(layer.traits);
          const normalizationFactor = 100 / totalRarity;
          return {
            ...layer,
            traits: layer.traits.map(trait => ({
              ...trait,
              rarity: Math.round(trait.rarity * normalizationFactor * 100) / 100,
            })),
          };
        }
        return layer;
      })
    );
    setNormalizeDialogOpen(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Rarity Configuration</h2>
      {layers.map(layer => (
        <Accordion
          key={layer.id}
          expanded={expandedLayer === layer.id}
          onChange={() => setExpandedLayer(expandedLayer === layer.id ? false : layer.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{layer.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Tooltip title="Set this rarity for all traits in this layer">
                <TextField
                  label="Bulk Rarity"
                  type="number"
                  value={bulkRarity}
                  onChange={(e) => setBulkRarity(Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Tooltip>
              <Button variant="contained" onClick={() => handleBulkRarityChange(layer.id)}>
                Apply to All
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between">
              <Box width="60%">
                {layer.traits.map((trait, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle1">{trait.name}</Typography>
                    <Box display="flex" alignItems="center">
                      <Slider
                        value={trait.rarity}
                        onChange={(_, newValue) => handleRarityChange(layer.id, index, newValue as number)}
                        aria-labelledby="continuous-slider"
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <TextField
                        value={trait.rarity}
                        onChange={(e) => handleRarityChange(layer.id, index, Number(e.target.value))}
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 70 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box width="35%">
                <PieChart
                  data={layer.traits.map((trait, index) => ({
                    title: trait.name,
                    value: trait.rarity,
                    color: `hsl(${index * 137.5 % 360}, 50%, 50%)`,
                  }))}
                  label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
                  labelStyle={{ fontSize: '5px', fill: 'white' }}
                />
                <Box mt={2}>
                  {layer.traits.map((trait, index) => (
                    <Typography key={index} variant="caption" display="block">
                      <span style={{ color: `hsl(${index * 137.5 % 360}, 50%, 50%)` }}>■</span> {trait.name}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box mt={2}>
              <Typography>Total Rarity: {calculateTotalRarity(layer.traits).toFixed(2)}%</Typography>
              <Tooltip title="Adjust rarities to sum up to 100%">
                <Button variant="outlined" onClick={() => setNormalizeDialogOpen(layer.id)}>
                  Normalize Rarities
                </Button>
              </Tooltip>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      <Dialog
        open={!!normalizeDialogOpen}
        onClose={() => setNormalizeDialogOpen(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Normalize Rarities?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will adjust the rarities of all traits in this layer to sum up to 100%. 
            The relative proportions between traits will be maintained. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNormalizeDialogOpen(null)}>Cancel</Button>
          <Button onClick={() => normalizeRarities(normalizeDialogOpen!)} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RarityConfigurationLamba;
