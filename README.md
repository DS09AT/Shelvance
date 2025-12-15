# Shelvance

<p align="center">
  <img src="https://raw.githubusercontent.com/DS09AT/Shelvance/main/Logo/256.png" alt="Shelvance Logo" width="200"/>
</p>

<p align="center">
  <em>E-book and audiobook library manager that organizes your collection and automates finding and downloading new releases.</em>
</p>

## About

Shelvance is a continuation of Readarr after it was retired and archived. Development continues here with bug fixes and new features. Significant changes have been made to the codebase, including a complete rebuild of the metadata system.

### Migration Notice

Due to breaking changes in metadata providers (Goodreads no longer available, Open Library integration introduced), migration from Readarr is **not guaranteed to work**. A fresh installation is recommended.

**Key changes:**
- Goodreads metadata provider removed
- Open Library metadata provider implemented (breaking change)
- SDK 8.0, React 19, React Router v7 and other package upgrades  
- Project Gutenberg indexer support
- QNAP Download Station support (HTTP and torrents)
- Improved author search with relevance sorting
- Enhanced metadata display

## Status

Work in progress. Features may be incomplete or unstable. No warranty or liability. Use at your own risk.

## Features

- Automatic quality upgrades (e.g., PDF to EPUB, MOBI to AZW3)
- Multi-platform support (Windows, Linux, macOS, Raspberry Pi)
- RSS feed monitoring for new releases
- Existing library scanning and gap detection
- Automatic failed download handling with fallback
- Manual search and release inspection
- Customizable quality profiles
- Configurable file renaming
- Download client integration: SABnzbd, NZBGet, QBittorrent, Deluge, rTorrent, Transmission, uTorrent, QNAP Download Station, etc.
- Calibre integration (requires Calibre Content Server)
- Web-based UI

## Installation

Download releases from [GitHub Releases](https://github.com/DS09AT/Shelvance/releases).

Packages available for:
- Windows (x64, x86)
- Linux (x64, arm, arm64)
- macOS (x64, arm64)
- Docker

Extract and run the executable. Access the web interface at `http://localhost:8787`.

Detailed installation instructions: [Documentation](https://shelvance.org/docs)

## Documentation

- [Main Documentation](https://shelvance.org/docs)
- [API Reference](https://shelvance.org/api)

## Support

- [GitHub Issues](https://github.com/DS09AT/Shelvance/issues) - Bug reports and feature requests only
- [GitHub Discussions](https://github.com/DS09AT/Shelvance/discussions) - General questions and support

Feature requests are welcome. Please submit them via [GitHub Issues](https://github.com/DS09AT/Shelvance/issues/new/choose).

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

Security vulnerabilities should be reported via email to [security@shelvance.org](mailto:security@shelvance.org). See [SECURITY.md](SECURITY.md) for details.

## Support Development

If you find Shelvance useful, consider supporting development:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-support-yellow)](https://buymeacoffee.com/shelvance)

## Roadmap

Features planned for future releases:

- **Google Books Metadata Provider** - Additional metadata source
- **Comics & Manga Support** - Better handling of comics and anime content
- **Multiple Reading Lists** - Support for multiple import list providers
- **Frontend Rebuild** - Complete UI overhaul with Tailwind CSS v4 for modern, responsive design (Work in progress)
- **Backend Modernization** - Code review, cleanup, and updates to latest standards
- **OPDS Support** - Open Publication Distribution System for catalog sharing with ebook readers
- **Built-in Ebook Reader** - Read books directly in the web interface
- **Audiobook Player** - Listen to audiobooks in the web interface
- **Mobile App** - Native mobile application
- **Plugin System** - Extensibility through standardized plugins
- **Analytics & Statistics** - Library insights, reading statistics, collection analysis
- **Book Series Support** - Reintroduction of series tracking (currently broken due to Goodreads migration)

No timeline guarantees. Priorities subject to change.

## License

[GNU GPL v3](http://www.gnu.org/licenses/gpl.html)

Originally forked from Readarr.

