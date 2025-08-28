package db

import (
	"database/sql"
	"fmt"

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
	query := `INSERT INTO users (username, password, created_at, is_admin) VALUES (?, ?, ?, 0)`
	result, err := db.conn.Exec(query, username, hashedPassword, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetUserByUsername(username string) (*models.User, string, error) {
	query := `SELECT id, username, password, created_at, COALESCE(is_admin, 0) FROM users WHERE username = ?`
	var user models.User
	var hashedPassword string
	err := db.conn.QueryRow(query, username).Scan(&user.ID, &user.Username, &hashedPassword, &user.CreatedAt, &user.IsAdmin)
	if err != nil {
		return nil, "", err
	}
	return &user, hashedPassword, nil
}

func (db *Database) CreateLink(userID int, url string, description, tags, category *string, createdAt string, isPrivate bool) (int64, error) {
	query := `INSERT INTO links (user_id, url, description, tags, category, created_at, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := db.conn.Exec(query, userID, url, description, tags, category, createdAt, isPrivate)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetLinksByUserID(userID int) ([]models.Link, error) {
	query := `SELECT l.id, l.user_id, l.url, l.description, l.tags, l.category, l.created_at, l.is_private, l.is_favorite, COALESCE(l.access_count, 0), COALESCE(l.is_locked, 0), u.username FROM links l JOIN users u ON l.user_id = u.id WHERE l.user_id = ? ORDER BY l.created_at DESC`
	rows, err := db.conn.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var link models.Link
		err := rows.Scan(&link.ID, &link.UserID, &link.URL, &link.Description, &link.Tags, &link.Category, &link.CreatedAt, &link.IsPrivate, &link.IsFavorite, &link.AccessCount, &link.IsLocked, &link.Username)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}
	return links, nil
}

func (db *Database) CreateOAuthUser(email, username, googleID, createdAt string) (int64, error) {
	query := `INSERT INTO users (username, email, google_id, created_at, is_admin) VALUES (?, ?, ?, ?, 0)`
	result, err := db.conn.Exec(query, username, email, googleID, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *Database) GetUserByGoogleID(googleID string) (*models.User, error) {
	query := `SELECT id, username, email, created_at, COALESCE(is_admin, 0) FROM users WHERE google_id = ?`
	var user models.User
	var userEmail string
	err := db.conn.QueryRow(query, googleID).Scan(&user.ID, &user.Username, &userEmail, &user.CreatedAt, &user.IsAdmin)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *Database) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, username, email, created_at, COALESCE(is_admin, 0) FROM users WHERE email = ?`
	var user models.User
	var userEmail string
	err := db.conn.QueryRow(query, email).Scan(&user.ID, &user.Username, &userEmail, &user.CreatedAt, &user.IsAdmin)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *Database) GetPublicLinks() ([]models.Link, error) {
	query := `SELECT l.id, l.user_id, l.url, l.description, l.tags, l.category, l.created_at, l.is_private, l.is_favorite, COALESCE(l.access_count, 0), COALESCE(l.is_locked, 0), u.username FROM links l JOIN users u ON l.user_id = u.id WHERE l.is_private = 0 ORDER BY l.created_at DESC`
	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var link models.Link
		err := rows.Scan(&link.ID, &link.UserID, &link.URL, &link.Description, &link.Tags, &link.Category, &link.CreatedAt, &link.IsPrivate, &link.IsFavorite, &link.AccessCount, &link.IsLocked, &link.Username)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}
	return links, nil
}

func (db *Database) ToggleFavorite(linkID, userID int, isFavorite bool) error {
	query := `UPDATE links SET is_favorite = ? WHERE id = ? AND user_id = ?`
	result, err := db.conn.Exec(query, isFavorite, linkID, userID)
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

func (db *Database) TogglePrivacy(linkID, userID int, isPrivate bool) error {
	// Check if link is locked first
	query := `SELECT is_locked FROM links WHERE id = ? AND user_id = ?`
	var isLocked bool
	err := db.conn.QueryRow(query, linkID, userID).Scan(&isLocked)
	if err != nil {
		return err
	}
	
	// If locked, prevent privacy changes
	if isLocked {
		return fmt.Errorf("link privacy is locked by administrator")
	}
	
	query = `UPDATE links SET is_private = ? WHERE id = ? AND user_id = ?`
	result, err := db.conn.Exec(query, isPrivate, linkID, userID)
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

func (db *Database) IncrementAccessCount(linkID int) error {
	query := `UPDATE links SET access_count = access_count + 1 WHERE id = ?`
	_, err := db.conn.Exec(query, linkID)
	return err
}

// Admin functions
func (db *Database) GetAllLinks() ([]models.Link, error) {
	query := `SELECT l.id, l.user_id, l.url, l.description, l.tags, l.category, l.created_at, l.is_private, l.is_favorite, COALESCE(l.access_count, 0), COALESCE(l.is_locked, 0), u.username FROM links l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC`
	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var link models.Link
		err := rows.Scan(&link.ID, &link.UserID, &link.URL, &link.Description, &link.Tags, &link.Category, &link.CreatedAt, &link.IsPrivate, &link.IsFavorite, &link.AccessCount, &link.IsLocked, &link.Username)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}
	return links, nil
}

func (db *Database) GetAllUsers() ([]models.User, error) {
	query := `SELECT id, username, created_at, COALESCE(is_admin, 0) FROM users ORDER BY created_at DESC`
	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Username, &user.CreatedAt, &user.IsAdmin)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (db *Database) AdminDeleteLink(linkID int) error {
	query := `DELETE FROM links WHERE id = ?`
	result, err := db.conn.Exec(query, linkID)
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

func (db *Database) AdminToggleLinkLock(linkID int, isLocked bool) error {
	query := `UPDATE links SET is_locked = ? WHERE id = ?`
	result, err := db.conn.Exec(query, isLocked, linkID)
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

func (db *Database) AdminForcePrivateLink(linkID int) error {
	query := `UPDATE links SET is_private = 1, is_locked = 1 WHERE id = ?`
	result, err := db.conn.Exec(query, linkID)
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

func (db *Database) AdminToggleUserAdmin(userID int, isAdmin bool) error {
	query := `UPDATE users SET is_admin = ? WHERE id = ?`
	result, err := db.conn.Exec(query, isAdmin, userID)
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

func (db *Database) AdminDeleteUser(userID int) error {
	// First delete all user's links
	_, err := db.conn.Exec(`DELETE FROM links WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}
	
	// Then delete the user
	query := `DELETE FROM users WHERE id = ?`
	result, err := db.conn.Exec(query, userID)
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

	// Create links table with user_id and privacy
	linksTable := `
	CREATE TABLE IF NOT EXISTS links (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		url TEXT NOT NULL,
		description TEXT,
		tags TEXT,
		created_at TEXT NOT NULL,
		is_private BOOLEAN NOT NULL DEFAULT 0,
		is_favorite BOOLEAN NOT NULL DEFAULT 0,
		FOREIGN KEY (user_id) REFERENCES users (id)
	)`

	if _, err := db.conn.Exec(linksTable); err != nil {
		return err
	}

	// Add is_private column if it doesn't exist (migration)
	migrationQuery := `ALTER TABLE links ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT 0`
	db.conn.Exec(migrationQuery) // Ignore error if column already exists

	// Add is_favorite column if it doesn't exist (migration)
	migrationQuery2 := `ALTER TABLE links ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT 0`
	db.conn.Exec(migrationQuery2) // Ignore error if column already exists

	// Add access_count column if it doesn't exist (migration)
	migrationQuery3 := `ALTER TABLE links ADD COLUMN access_count INTEGER NOT NULL DEFAULT 0`
	db.conn.Exec(migrationQuery3) // Ignore error if column already exists

	// Add category column if it doesn't exist (migration)
	migrationQuery4 := `ALTER TABLE links ADD COLUMN category TEXT`
	db.conn.Exec(migrationQuery4) // Ignore error if column already exists

	// Add is_admin column to users if it doesn't exist (migration)
	migrationQuery5 := `ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0`
	db.conn.Exec(migrationQuery5) // Ignore error if column already exists

	// Add is_locked column to links if it doesn't exist (migration)
	migrationQuery6 := `ALTER TABLE links ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT 0`
	db.conn.Exec(migrationQuery6) // Ignore error if column already exists

	return nil
}