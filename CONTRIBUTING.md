# Contributing to Colour Me Brazil

First off, thank you for considering contributing to Colour Me Brazil! It's people like you that make this educational platform better for children around the world.

## 🌟 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together and help each other
- **Be Inclusive**: Welcome people of all backgrounds and skill levels
- **Child Safety First**: Always prioritize the safety and privacy of children

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. iOS, Windows]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Content Contributions

We welcome educational content contributions! If you'd like to contribute:

#### Stories and Books
- Must be age-appropriate for 6-12 year olds
- Culturally sensitive and accurate regarding Brazilian culture
- Available in both English and Portuguese (or willing to have it translated)
- Original content or properly licensed
- Include educational value

#### Artwork and Illustrations
- High-quality, child-appropriate artwork
- Cultural accuracy is essential
- Must have rights to contribute the artwork
- SVG format preferred for coloring pages

### Code Contributions

#### Development Setup

1. **Fork the repository**
   ```bash
   gh repo fork colourmebrazil/webapp
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/colour-me-brazil.git
   cd colour-me-brazil
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

7. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

8. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

#### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(library): add book search functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
test(components): add ErrorBoundary tests
```

#### Pull Request Process

1. **Update documentation** for any changes in functionality
2. **Add tests** that prove your fix/feature works
3. **Ensure all tests pass** (`npm test`)
4. **Run linter** (`npm run lint:fix`)
5. **Update CHANGELOG.md** if applicable
6. **Create pull request** with a clear title and description

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in complex areas
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Testing
Describe the tests you ran and how to reproduce

## Screenshots (if applicable)
Add screenshots if relevant

## Additional Notes
Any additional information
```

## 📝 Style Guides

### JavaScript/React Style Guide

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable and function names
- Comment complex logic
- Keep components small and focused
- Use TypeScript types where beneficial

**Example:**
```javascript
// Good
function BookCard({ book, onSelect }) {
  const handleClick = () => {
    onSelect(book.id);
  };

  return (
    <Card onClick={handleClick}>
      <h3>{book.title}</h3>
      <p>{book.description}</p>
    </Card>
  );
}

// Bad
function BC({ b, oS }) {
  return <div onClick={() => oS(b.i)}>{b.t}</div>;
}
```

### CSS/Tailwind Style Guide

- Use Tailwind utility classes
- Keep custom CSS minimal
- Use CSS variables for theming
- Mobile-first responsive design
- Maintain consistent spacing

### Documentation Style Guide

- Use clear, concise language
- Include code examples
- Keep README.md up to date
- Document all public APIs
- Use proper markdown formatting

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email security@colourmebrazil.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

### Security Guidelines

- Never commit sensitive data (API keys, passwords, etc.)
- Always use environment variables for configuration
- Follow COPPA compliance requirements
- Validate and sanitize all user input
- Use prepared statements for database queries
- Keep dependencies up to date

## 🎨 Design Guidelines

### Visual Design

- Follow Brazilian color palette (oranges, blues, greens)
- Maintain playful but professional tone
- Use child-friendly, clear fonts
- Ensure high contrast for readability
- Include alt text for all images

### UX Guidelines

- Keep navigation simple and intuitive
- Design for both touch and mouse input
- Provide clear feedback for actions
- Use loading states and error messages
- Make forms easy to understand

### Accessibility

- Follow WCAG 2.1 Level AA standards
- Provide keyboard navigation
- Include ARIA labels
- Test with screen readers
- Ensure color contrast ratios
- Add skip navigation links

## 🌍 Translation and Localization

We welcome translations! If you'd like to contribute translations:

1. Check if translation exists in `/locales`
2. Use translation keys consistently
3. Maintain context in translations
4. Test right-to-left languages if applicable
5. Include cultural adaptations when necessary

## 📊 Testing Guidelines

### Unit Tests

- Test individual components and functions
- Aim for >80% code coverage
- Mock external dependencies
- Test edge cases and error states

### Integration Tests

- Test component interactions
- Test data flow
- Test user workflows

### E2E Tests (if applicable)

- Test critical user paths
- Test on multiple browsers
- Test responsive layouts

## 🤝 Community

### Communication Channels

- **GitHub Discussions**: General discussions
- **GitHub Issues**: Bug reports and feature requests
- **Email**: team@colourmebrazil.com

### Getting Help

- Check documentation first
- Search existing issues
- Ask in GitHub Discussions
- Email the team if needed

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Annual contributor showcase

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make Colour Me Brazil better for thousands of children learning about Brazilian culture. Thank you for your time and effort!

---

**Questions?** Contact us at contribute@colourmebrazil.com

🦜 Happy Contributing! 🎨
