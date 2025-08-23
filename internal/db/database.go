package db

import (
	"database/sql"

	"links/internal/models"

	_ "modernc.org/sqlite"
)

type Database struct {
	conn *sql.DB
}

func New(dataSource string) (*Database, error) {
	conn, err := sql.Open("sqlite", dataSource)
	if err != nil {
		return nil, err
	}

	db := &Database{conn: conn}
	
	if err := db.createTables(); err != nil {
		return nil, err
	}

	return db, nil
}

func (db *Database) Close() error {
	return db.conn.Close()
}

func (db *Database) CreateUser(username, hashedPassword, createdAt string) (int64, error) {
	query := `INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)`
	result, err := db.conn.Exec(query, username, hashedPassword, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetUserByUsername(username string) (*models.User, string, error) {
	query := `SELECT id, username, password, created_at FROM users WHERE username = ?`
	var user models.User
	var hashedPassword string
	err := db.conn.QueryRow(query, username).Scan(&user.ID, &user.Username, &hashedPassword, &user.CreatedAt)
	if err != nil {
		return nil, "", err
	}
	return &user, hashedPassword, nil
}

func (db *Database) CreateLink(userID int, url string, description, tags *string, createdAt string) (int64, error) {
	query := `INSERT INTO links (user_id, url, description, tags, created_at) VALUES (?, ?, ?, ?, ?)`
	result, err := db.conn.Exec(query, userID, url, description, tags, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetLinksByUserID(userID int) ([]models.Link, error) {
	query := `SELECT id, user_id, url, description, tags, created_at FROM links WHERE user_id = ? ORDER BY created_at DESC`
	rows, err := db.conn.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var link models.Link
		err := rows.Scan(&link.ID, &link.UserID, &link.URL, &link.Description, &link.Tags, &link.CreatedAt)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}
	return links, nil
}

func (db *Database) CreateOAuthUser(email, username, googleID, createdAt string) (int64, error) {
	query := `INSERT INTO users (username, email, google_id, created_at) VALUES (?, ?, ?, ?)`
	result, err := db.conn.Exec(query, username, email, googleID, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetUserByGoogleID(googleID string) (*models.User, error) {
	query := `SELECT id, username, email, created_at FROM users WHERE google_id = ?`
	var user models.User
	var userEmail string
	err := db.conn.QueryRow(query, googleID).Scan(&user.ID, &user.Username, &userEmail, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *Database) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, username, email, created_at FROM users WHERE email = ?`
	var user models.User
	var userEmail string
	err := db.conn.QueryRow(query, email).Scan(&user.ID, &user.Username, &userEmail, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *Database) DeleteLink(linkID, userID int) error {
	query := `DELETE FROM links WHERE id = ? AND user_id = ?`
	result, err := db.conn.Exec(query, linkID, userID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	
	return nil
}

func (db *Database) createTables() error {
	// Create users table with OAuth support
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password TEXT,
		email TEXT,
		google_id TEXT,
		created_at TEXT NOT NULL
	)`

	if _, err := db.conn.Exec(usersTable); err != nil {
		return err
	}

	// Create links table with user_id
	linksTable := `
	CREATE TABLE IF NOT EXISTS links (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		url TEXT NOT NULL,
		description TEXT,
		tags TEXT,
		created_at TEXT NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users (id)
	)`

	_, err := db.conn.Exec(linksTable)
	return err
}