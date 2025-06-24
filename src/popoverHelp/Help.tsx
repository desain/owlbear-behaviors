import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import helpContent from "./help-content.json";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`help-tabpanel-${index}`}
            aria-labelledby={`help-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export function Help() {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={tabValue}
                    onChange={(_e, n: number) => setTabValue(n)}
                >
                    <Tab label="🏁 Quick Start" />
                    <Tab label="📖 How to Use" />
                    <Tab label="💡 Ideas" />
                </Tabs>
            </Box>
            <Box sx={{ height: "calc(100% - 48px)", overflow: "auto" }}>
                <TabPanel value={tabValue} index={0}>
                    <ReactMarkdown>{helpContent.quickStart}</ReactMarkdown>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <ReactMarkdown>{helpContent.howToUse}</ReactMarkdown>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <ReactMarkdown>{helpContent.ideas}</ReactMarkdown>
                </TabPanel>
            </Box>
        </Box>
    );
}
