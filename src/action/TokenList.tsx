import { Edit, ExpandMore } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import { BehaviorItem } from "../BehaviorItem";

export function TokenList() {
    const tokensWithBehaviors = usePlayerStorage((s) => s.itemsOfInterest);

    if (tokensWithBehaviors.size === 0) {
        return null;
    }

    return (
        <Accordion sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            "&.Mui-expanded": {
                margin: 0,
            },
        }}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                    fontWeight: "bold",
                    "& .MuiAccordionSummary-content": {
                        margin: "8px 0",
                    },
                    "&.Mui-expanded": {
                        minHeight: "48px",
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Tokens with Behaviors
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
                <List dense>
                    {Array.from(tokensWithBehaviors.values()).map((item: BehaviorItem) => (
                        <ListItem
                            key={item.id}
                            secondaryAction={
                                <Tooltip title="Edit Behaviors">
                                    <IconButton
                                        edge="end"
                                        onClick={() => openEditBehaviors(item.id)}
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                            }
                        >
                            <ListItemText primary={item.name} />
                        </ListItem>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}
