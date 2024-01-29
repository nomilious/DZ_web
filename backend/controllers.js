const getWorkers = async (req, res) => {
    try {
        const data = await db.getWorkers();
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ data });
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting tasklists and tasks error: ${error}`,
        });
    }
};
