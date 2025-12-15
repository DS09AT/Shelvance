# Contributing to Shelvance

Thanks for taking the time to contribute!

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help. Please read the relevant section before making your contribution.

> If you like the project but don't have time to contribute, there are other ways to support it:
> - Star the project on GitHub
> - Share it on social media
> - Mention it in your project's readme
> - Tell others about it

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)

## Code of Conduct

This project is governed by the [Shelvance Code of Conduct](https://github.com/DS09AT/Shelvance/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Report unacceptable behavior to [contact@shelvance.org](mailto:contact@shelvance.org).

## I Have a Question

Before asking a question, search for existing [Issues](https://github.com/DS09AT/Shelvance/issues) and check the [Documentation](https://shelvance.org/docs).

If you still need clarification:

- Open an [Issue](https://github.com/DS09AT/Shelvance/issues/new)
- Provide context about what you're running into
- Include platform and version information (OS, .NET runtime version, etc.)

For general discussions, use [GitHub Discussions](https://github.com/DS09AT/Shelvance/discussions).

## I Want To Contribute

### Legal Notice

When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content, and that the content you contribute may be provided under the project license (GPL v3).

### Developer Certificate of Origin (DCO)

All commits must be signed off to certify that you have the right to submit the code under the project's license. This is done by adding a `Signed-off-by` line to your commit messages.

**How to sign off commits:**

```bash
git commit -s -m "Your commit message"
```

This adds a line like:
```
Signed-off-by: Your Name <your.email@example.com>
```

By signing off, you certify that you wrote the code or have the right to submit it under GPL v3, as per the [Developer Certificate of Origin](https://developercertificate.org/).

GitHub's web interface will prompt you to sign off when creating commits through the browser.

### Reporting Bugs

#### Before Submitting a Bug Report

- Use the latest version
- Check the [documentation](https://shelvance.org/docs) to verify it's not a configuration issue
- Search existing [bug reports](https://github.com/DS09AT/Shelvance/issues?q=label%3Abug)
- Collect information:
  - Stack trace if available
  - OS, platform, and version (Windows, Linux, macOS, architecture)
  - .NET runtime version
  - Steps to reproduce
  - Expected vs actual behavior

#### How Do I Submit a Good Bug Report?

**Security Issues:** Never report security vulnerabilities publicly. Send them to [security@shelvance.org](mailto:security@shelvance.org).

For other bugs, open an [Issue](https://github.com/DS09AT/Shelvance/issues/new) with:

- Clear description of expected vs actual behavior
- Detailed reproduction steps
- All collected information from above
- Relevant logs (check `logs/` directory)

Once filed, the maintainer will:
- Label the issue appropriately
- Attempt to reproduce with your steps
- Mark as `needs-repro` if reproduction steps are unclear
- Mark as `needs-fix` once confirmed

### Suggesting Enhancements

Feature requests are welcome. See the [Roadmap](https://github.com/DS09AT/Shelvance#roadmap) for planned features.

#### Before Submitting an Enhancement

- Use the latest version
- Check the [documentation](https://shelvance.org/docs) and [roadmap](https://github.com/DS09AT/Shelvance#roadmap)
- Search existing [enhancement requests](https://github.com/DS09AT/Shelvance/issues?q=label%3Aenhancement)
- Consider if it fits the project scope and would benefit most users

#### How Do I Submit a Good Enhancement Suggestion?

Open a [GitHub Issue](https://github.com/DS09AT/Shelvance/issues/new) with:

- Clear and descriptive title
- Step-by-step description of the proposed enhancement
- Current behavior vs expected behavior
- Why this would be useful to most users
- Screenshots or mockups if applicable
- Examples from other projects if relevant

### Your First Code Contribution

#### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Shelvance.git`
3. Install dependencies:
   - .NET 8 SDK
   - Node.js (for frontend)
4. Build the project: `./build-dev.sh`
5. Run from the output folder: `./Shelvance.exe` or `./Shelvance`

#### Development Workflow

- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make your changes
- Test your changes locally
- Commit with clear messages (see [Commit Messages](#commit-messages))
- Push to your fork
- Open a Pull Request with:
  - Description of changes
  - Related issue number (if applicable)
  - Screenshots (for UI changes)

### Improving The Documentation

Documentation and the website are located in the main repository under the `docs` branch. The `docs/` subfolder contains the application documentation.

To contribute:
- Checkout the `docs` branch: `git checkout docs`
- Navigate to the `docs/` folder for application documentation
- Fix typos, unclear explanations, or outdated information
- Add missing documentation
- Improve examples and guides
- Submit PRs to the `docs` branch

## Styleguides

### Commit Messages

- Use clear, descriptive messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers when applicable
- Examples:
  - `Fix metadata parsing for new metadata provider (#123)`
  - `Add Download Client Provider support`
  - `Update frontend package to v3`

### Code Style

- Follow existing code patterns in the project
- Backend: C# with standard .NET conventions
- Frontend: React with hooks, functional components preferred
- Run linters before committing
