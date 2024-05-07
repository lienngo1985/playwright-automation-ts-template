import { test, expect, type Page } from '@playwright/test';

test.describe('Todos', () => {

    const TODO_ITEMS = [
        'go to Costco and buy egg and milk',
        'have dental appointment at 3:00 pm',
        'pick-up children at 5:00 pm at school'
    ];

    test.beforeEach ('navigation', async ({ page }) => {
        await page.goto('https://demo.playwright.dev/todomvc/#/');
        await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    });

    test('Verify the user is able to add todo items', async ({ page }) => {
        const newTodo = page.getByPlaceholder('What needs to be done?');

        // Add 1st todo and check if item added successfully
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');
        await expect(page.locator('//label[@data-testid="todo-title"]')).toHaveText(TODO_ITEMS[0]);

        // Add 2nd todo and check if item added successfully
        await newTodo.fill(TODO_ITEMS[1]);
        await newTodo.press('Enter');
        await expect(page.locator('//label[@data-testid="todo-title"]')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);

        // Add 3rd todo and check if item added successfully
        await newTodo.fill(TODO_ITEMS[2]);
        await newTodo.press('Enter');
        await expect(page.locator('//label[@data-testid="todo-title"]')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1], TODO_ITEMS[2]]);

        // Check number of todo items in local storage
        await checkNumberOfTodosInLocalStorage(page, 3)
    });

    test('Verify text field is clear when a todo item is added to todo list', async ({ page }) => {
        const newTodo = page.getByPlaceholder('What needs to be done?');
        
        // Add todo item
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');

        // Check text field is clear
        await expect(newTodo).toBeEmpty();
       
        // Check number of todo items in local storage
        await checkNumberOfTodosInLocalStorage(page, 1)
    })

    test('Verify the user can mark added todo items as completed', async ({ page }) => {
        const newTodo = page.getByPlaceholder('What needs to be done?');

        // add 1st todo item and mark it as completed
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');
        //await page.locator('li').filter({ hasText: TODO_ITEMS[0] }).getByLabel('Toggle Todo').click();
        await page.locator('//li[@data-testid="todo-item"]').nth(0).getByRole('checkbox').check();
        expect (page.locator('//li[@data-testid="todo-item"]').nth(0)).toHaveClass('completed');

        // add 2nd todo item and mark it as completed
        await newTodo.fill(TODO_ITEMS[1]);
        await newTodo.press('Enter');   
        //await page.locator('li').filter({ hasText: TODO_ITEMS[1] }).getByLabel('Toggle Todo').click();
        await page.locator('//li[@data-testid="todo-item"]').nth(1).getByRole('checkbox').check();
        expect (page.locator('//li[@data-testid="todo-item"]').nth(0)).toHaveClass('completed');

        // Check number of todo items in local storage
        await checkNumberOfTodosInLocalStorage(page, 2);

        // check items completed in Local Storage
        await checkTodosCompletedInLocalStorage(page, 2);
    })

    test('Verify the user can edit a todo item', async ({ page }) => {
 
        createTodoListItems(page, TODO_ITEMS);

        const newTodo = page.getByPlaceholder('What needs to be done?');
        const thirdTodo = page.locator('//li[@data-testid="todo-item"]').nth(2);

        // edit 3rd todo item
        await thirdTodo.dblclick();
        await thirdTodo.getByRole('textbox', {name: 'Edit'}).fill('have parent appointment at 5:00 PM');
        await thirdTodo.getByRole('textbox', {name: 'Edit'}).press('Enter');

        // check item is editted successfully
        await expect(page.locator('//li[@data-testid="todo-item"]')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1], 'have parent appointment at 5:00 PM']);

        await checkTodosInLocalStorage(page, 'have parent appointment at 5:00 PM');
    })
})

async function createTodoListItems(page: Page, list) {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    for (const item of list) {
        await newTodo.fill(item);
        await newTodo.press('Enter');
    }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
    const noOfTodos = await page.waitForFunction(e => {
      return JSON.parse(localStorage['react-todos']).length === e;
    }, expected);
    return noOfTodos;
}

async function checkTodosCompletedInLocalStorage(page: Page, expected: number){
    const noOfCompletedTodo = await page.waitForFunction(e => {
        return JSON.parse(localStorage['react-todos']).filter(
            (todo: Record<string, unknown>) => todo.completed).length === e
    }, expected)
};

async function checkTodosInLocalStorage(page: Page, title: string) {
    const checkTodos = await page.waitForFunction(t => {
        return JSON.parse(localStorage['react-todos'])
        .map((todo: Record<string, unknown>) => todo.title)
        .includes(t);
    }, title);
    return checkTodos;
}



