const fs = require('fs');
const path = require('path');

class ManagerMapping {
    constructor() {
        this.managerMap = new Map(); // Map<string, string> - name -> discord ID
        this.isLoaded = false;
    }

    /**
     * Load manager data from CSV file
     * CSV format: STT,Họ và tên,Chức vụ,ID
     */
    loadManagerData() {
        try {
            const csvPath = path.join(__dirname, '../../id.csv');

            if (!fs.existsSync(csvPath)) {
                console.error('❌ File id.csv không tồn tại tại:', csvPath);
                return false;
            }

            // Read CSV file
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            const lines = csvContent.split('\n');

            // Skip header (first line)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue; // Skip empty lines

                // Parse CSV line: STT,Họ và tên,Chức vụ,ID
                const columns = line.split(',');

                if (columns.length >= 4) {
                    const managerName = columns[1].trim(); // Column: Họ và tên
                    const discordId = columns[3].trim();   // Column: ID

                    // Validate discord ID (should be numeric)
                    if (managerName && discordId && /^\d+$/.test(discordId)) {
                        this.managerMap.set(managerName, discordId);
                    }
                }
            }

            this.isLoaded = true;
            console.log(`✅ Loaded ${this.managerMap.size} managers from id.csv`);
            return true;

        } catch (error) {
            console.error('❌ Error loading manager data from CSV:', error);
            return false;
        }
    }

    /**
     * Get Discord ID by manager name (exact match, case-sensitive)
     * @param {string} managerName - Manager's full name
     * @returns {string|null} Discord ID or null if not found
     */
    getManagerIdByName(managerName) {
        if (!this.isLoaded) {
            console.error('⚠️ Manager data not loaded. Call loadManagerData() first.');
            return null;
        }

        const trimmedName = managerName.trim();
        return this.managerMap.get(trimmedName) || null;
    }

    /**
     * Get all manager names
     * @returns {Array<string>} Array of all manager names
     */
    getAllManagerNames() {
        if (!this.isLoaded) {
            console.error('⚠️ Manager data not loaded. Call loadManagerData() first.');
            return [];
        }

        return Array.from(this.managerMap.keys());
    }

    /**
     * Check if a manager name exists in the system
     * @param {string} managerName - Manager's full name
     * @returns {boolean}
     */
    hasManager(managerName) {
        if (!this.isLoaded) return false;
        return this.managerMap.has(managerName.trim());
    }

    /**
     * Get total number of managers loaded
     * @returns {number}
     */
    getManagerCount() {
        return this.managerMap.size;
    }
}

// Export singleton instance
module.exports = new ManagerMapping();
