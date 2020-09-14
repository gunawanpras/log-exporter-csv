const moment = require('moment');
const { writeToPath } = require('fast-csv');
const fs = require('fs');
const { createInterface } = require('readline');

const exportCSV = (rows) => {
    try {
        writeToPath(process.cwd() + '/output/head100.csv', rows, { headers:true })
        .on('error', err => {
            console.log(err);
            throw new Error(err);
        })
        .on('finish', () => {
            console.log('Done writing.');            
        });
    } catch (error) {
        return res.json({ error });
    }
    
}

class LogController {
    async exportLog(req, res, next) {
        try {
            const file = process.cwd() + '/log/data_mini_lv9compress.log';
            const rdline = createInterface({
                input: fs.createReadStream(file),
                crlfDelay: Infinity
            });

            let set_id, set_url = false;
            let logs = [];
            let log_data = {};
            
            const url = '([a-z0-9]\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)';
            const ip = '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}';

            const server_ip_pattern = new RegExp(`${ip}((?=\\sdns,))`, 'g');
            const user_ip_pattern = new RegExp(`(?<=got query from\\s+|sending reply to\\s+).*?${ip}`, 'g');            
            const url_pattern = new RegExp(`(?<=question:\\s+)${url}{0}`, 'g');

            rdline
            .on('line', line => {
                const date = line.match(/[a-zA-Z]{3,4}\s[0-9]{2}\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/g);
                const server_ip = line.match(server_ip_pattern);                
                const user_ip = line.match(user_ip_pattern);
                const id = line.match(/sys:\sid:/g);
                const url_ = line.match(url_pattern);
                
                if (user_ip) {
                    set_id = false;
                    set_url = false;

                    const log_date = moment( new Date(date[0]) );
                    log_date.set({ year: 2019 });
                    log_data = { date_created: log_date.format('YYYY-MM-DD hh:mm:ss'), server_ip: server_ip[0], user_ip: user_ip[0] };
                    set_url = true;
                }
                else if (id) set_id = true;
                else if (set_url && set_id && url_) {
                    logs.push({ ...log_data, url: url_[0] });

                    set_id = false;
                    set_url = false;
                }
            })
            .on('close', line => {
                console.log('EOF');
                exportCSV(logs);

                return res.json('Done writing.');
            });
        } catch (error) {
            next(error);
        }
    }    
}

module.exports = new LogController();