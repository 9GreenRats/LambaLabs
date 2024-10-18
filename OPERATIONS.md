# Lamba Labs 4.0 Generative Art Tool - Operations Guide

## Trait Dependencies

Trait dependencies allow you to create complex rules for how traits from different layers can be combined. This feature enables more control over your generated images and can help create more cohesive and logical collections.

### Setting Up Trait Dependencies

1. Navigate to the "Rarity Configuration" step in the dashboard.
2. For each trait, you'll see a "+" button next to the rarity percentage input.
3. Click this button to add a dependency for the trait.
4. In the dependency section that appears:
   - Select the layer from the first dropdown.
   - Select the specific trait from the second dropdown.
5. You can add multiple dependencies for a single trait by clicking the "+" button again.

### Best Practices for Using Trait Dependencies

1. **Plan Your Dependencies**: Before setting up dependencies, plan out the logical relationships between your traits. For example, a "Sunglasses" trait might depend on a "Human" trait in the "Species" layer.

2. **Start Simple**: Begin with simple, one-to-one dependencies before creating more complex rules.

3. **Avoid Circular Dependencies**: Ensure that your dependencies don't create impossible situations. For example, if Trait A depends on Trait B, and Trait B depends on Trait A, neither will ever be selected.

4. **Use Dependencies Sparingly**: While dependencies can create more cohesive collections, overuse can severely limit the number of possible combinations.

5. **Test Thoroughly**: After setting up dependencies, generate a small batch of images to ensure the rules are working as expected.

6. **Document Your Rules**: Keep a record of your dependency rules, especially for complex collections. This will help you manage and update your collection in the future.

### Troubleshooting

- If you're not seeing certain traits appear in your generated images, check if they have dependencies that are not being met.
- If the generation process is taking longer than expected, you may have set up rules that are too restrictive. Try relaxing some dependencies.
- If you receive an error about no valid traits for a layer, it's likely that your dependencies have created a situation where no traits can be selected. Review and adjust your rules.

### Advanced Usage

- You can create "chains" of dependencies across multiple layers. For example, a "Hat" trait could depend on a "Hair" trait, which in turn depends on a "Species" trait.
- Use dependencies in combination with rarity settings for fine-grained control over your collection's composition.

Remember, the goal of trait dependencies is to enhance the logic and cohesion of your collection. Use this feature creatively to bring your artistic vision to life!
