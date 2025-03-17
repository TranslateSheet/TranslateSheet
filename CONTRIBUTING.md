# Contributing to TranslateSheet

Thank you for your interest in contributing to TranslateSheet! Your contributions help improve this project for everyone.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you agree to uphold this code, ensuring a welcoming and respectful community.

## How to Contribute

### Reporting Bugs

If you find a bug, please help us improve TranslateSheet by submitting a detailed issue. Include:

- A clear description of the bug.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Relevant screenshots or error logs, if applicable.

### Requesting Features

Have an idea for a new feature or improvement? Open an issue and describe:

- The functionality or enhancement you envision.
- How it would benefit the project.
- Any potential alternatives you considered.

### Submitting Pull Requests

When you're ready to contribute code:

1. **Create a Branch:**  
   Simply start by creating a new branch off of the main branch:
   ```bash
   git checkout -b my-feature-branch

2. **Make Your Changes:**
Write clear, concise code.
Add or update tests where necessary.
Follow the TypeScript style and formatting conventions.

3. **Commit Your Changes:**  
   Write meaningful commit messages that describe your changes.

4. **Push Your Branch:**  
   ```bash
   git push origin my-feature-branch
   ```
5. **Open a Pull Request:**
Submit a pull request against the main branch with a detailed description of your changes.


## Development Setup

To set up your development environment:

### Clone the Repository:
```bash
git clone https://github.com/your-username/translate-sheet.git
cd translate-sheet
```

### Install Dependencies:
```bash
bun install
```

### Run the Development Server:
```bash
bun start
```

## Coding Guidelines

### Language & Style:
TranslateSheet is written in TypeScript. Please adhere to the project's coding conventions and ensure your code is clean and modular.

### Translation Keys:
When adding or updating translation keys, follow the format for interpolated values (e.g., `{{value}}`) and ensure consistency across the project.

### Avoiding Duplicates:
If you introduce new namespaces or keys, please check for duplicates to prevent conflicts.

## Tests

### Write Tests:
Include tests for new features or bug fixes.

### Run Tests Locally:
Make sure all tests pass before submitting a pull request.

## Documentation

### Keep Documentation Updated:
If you add features or change functionality, update the README or add additional documentation as needed.


## Questions?

If you have any questions or need assistance, feel free to open an issue or reach out to the maintainers. We’re here to help!

Thank you for contributing to TranslateSheet and helping make it better for everyone!
