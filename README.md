# Bootstrap Tour Mendix

Highlight and guide users through new features or explain existing functionality.

### Instructions

1. Install the widget in your project
2. Include the widget on a page where you want to show a tour
3. Configure the widget's settings:
    1. On the **Walkthrough** tab, add steps:
        1. `Selector` : the name of the Mendix component you'd like to highlight. (optionally use CSS/jQuery selectors here)
        2. `Selector is Name` : if you used a CSS/jQuery selector in the first step, select "no" here. Otherwise, keep "yes"
        3. `Text` : the text to display in the helper popover next to the component you're highlighting.
        4. `Popover Position` : where (relative to the component) should the popover appear?
        5. `Show Backdrop` : should we dim the rest of the page to highlight this element?
        6. `Click to Continue` : If enabled, clicking on the element will trigger the next step in the tour.
    2. On the **Appearance** tab, add the Button Text and any extra classes you'd like to add to the trigger button.
    3. On the **Behavior** tab, you can add:
        1. `Auto Run` : A microflow to run to determine if the tour should start automatically
            > Default Behavior is that the tour will show once per user, and then they can always click the button to view it again. You can override this behavior using this microflow
 
        2. `Callback` : A microflow that runs when a user ends the tour.

### Known limitations

+ When snippets are present on the page, using `selector is name` as `true` could cause the widget show a popover multiple times, since Mendix element name uniqueness is not enforced across snippets. In these cases, add a unique classname to your tour elements and use `selector is name` as `false`.

###### Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example
