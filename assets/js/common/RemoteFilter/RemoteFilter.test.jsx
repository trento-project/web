import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RemoteFilter from '.';

describe('Filter component', () => {
  it('should render the options correctly', async () => {
    const user = userEvent.setup();

    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(<RemoteFilter options={options} title="names" />);

    // options are not rendered initially
    options.forEach((option) => {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    });

    await act(() =>
      // select a button which text starts with 'Filter '
      // click on the button to open the options
      user.click(screen.getByText(/Filter *.../))
    );

    // assert that the options are rendered
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should select an option when clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(<RemoteFilter options={options} title="names" onChange={mockOnChange} />);

    await act(() => user.click(screen.getByText(/Filter *.../)));

    await act(() => user.click(screen.getByText('Michael Scott')));

    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott']);
  });

  it('should select multiple items', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem = 'Michael Scott';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem]}
      />
    );

    await act(() => user.click(screen.getByText(selectedItem)));

    await act(() => user.click(screen.getByText('Jane Smith')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);

    expect(mockOnChange).toHaveBeenCalledWith([selectedItem, 'Jane Smith']);
  });

  it('should select with one element if passed as string', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem = 'Michael Scott';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={selectedItem}
      />
    );

    await act(() => user.click(screen.getByText(selectedItem)));

    await act(() => user.click(screen.getByText('Jane Smith')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);

    expect(mockOnChange).toHaveBeenCalledWith([selectedItem, 'Jane Smith']);
  });

  it('should deselect an item on multiple item selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem1 = 'Michael Scott';
    const selectedItem2 = 'Jane Smith';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem1, selectedItem2]}
      />
    );

    const filterText = [selectedItem1, selectedItem2].join(', ');
    await act(() => user.click(screen.getByText(filterText)));

    await act(() => user.click(screen.getByText('Jane Smith')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);

    expect(mockOnChange).toHaveBeenCalledWith([selectedItem1]);

    // the list of items is still visible
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should deselect an item on single item selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem = 'Michael Scott';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem]}
      />
    );

    await act(() => user.click(screen.getByText(selectedItem)));

    await act(() => user.click(screen.getAllByText(selectedItem)[1]));

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should use options with label', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      ['john-doe', 'John Doe'],
      ['jane-smith', 'Jane Smith'],
      ['michael-scott', 'Michael Scott'],
      ['ella-fitzgerald', 'Ella Fitzgerald'],
    ];

    const selectedItem = 'michael-scott';
    const selectedItemLabel = 'Michael Scott';

    const anotherSelectedItem = 'jane-smith';
    const anotherSelectedItemLabel = 'Jane Smith';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['michael-scott']}
      />
    );

    await act(() => user.click(screen.getByText(selectedItemLabel)));

    await act(() => {
      options.forEach(([, label]) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });

    await act(() =>
      user.click(screen.getAllByText(anotherSelectedItemLabel)[0])
    );

    expect(mockOnChange).toHaveBeenCalledWith([
      selectedItem,
      anotherSelectedItem,
    ]);
  });

  it('should render correctly mixed options', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'Michael Scott',
      undefined,
      ['john-doe', 'John Doe'],
      'Jane Smith',
    ];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['Michael Scott']}
      />
    );

    await act(() => user.click(screen.getByText('Michael Scott')));

    await act(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    /* Remember that the component is stateless, 
      it does not change its internal state on selection. */

    await act(() => user.click(screen.getByText('John Doe')));
    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott', 'john-doe']);

    await act(() => user.click(screen.getByText('Jane Smith')));
    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott', 'Jane Smith']);
  });

  it('should ignore undefined values', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['Michael Scott', undefined]}
      />
    );

    await act(() => user.click(screen.getByText('Michael Scott')));

    await act(() => {
      options.forEach((label) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });
  });

  it('should ignore undefined options', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      '5E8',
      undefined,
      '32S',
      '4B9',
      'MF5',
      'PRD',
      'QAS',
      'HA1',
      'HA2',
    ];
    const value = ['PRD'];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={value}
      />
    );

    await act(() => user.click(screen.getByText('PRD')));

    await act(() => {
      options.filter(Boolean).forEach((label) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });
  });

  it('should use options with label', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      ['john-doe', 'John Doe'],
      ['jane-smith', 'Jane Smith'],
      ['michael-scott', 'Michael Scott'],
      ['ella-fitzgerald', 'Ella Fitzgerald'],
    ];

    const selectedItem = 'michael-scott';
    const selectedItemLabel = 'Michael Scott';

    const anotherSelectedItem = 'jane-smith';
    const anotherSelectedItemLabel = 'Jane Smith';

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['michael-scott']}
      />
    );

    await act(() => user.click(screen.getByText(selectedItemLabel)));

    await act(() => {
      options.forEach(([, label]) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });

    await act(() =>
      user.click(screen.getAllByText(anotherSelectedItemLabel)[0])
    );

    expect(mockOnChange).toHaveBeenCalledWith([
      selectedItem,
      anotherSelectedItem,
    ]);
  });

  it('should render correctly mixed options', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'Michael Scott',
      undefined,
      ['john-doe', 'John Doe'],
      'Jane Smith',
    ];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['Michael Scott']}
      />
    );

    await act(() => user.click(screen.getByText('Michael Scott')));

    await act(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    /* Remember that the component is stateless, 
      it does not change its internal state on selection. */

    await act(() => user.click(screen.getByText('John Doe')));
    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott', 'john-doe']);

    await act(() => user.click(screen.getByText('Jane Smith')));
    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott', 'Jane Smith']);
  });

  it('should ignore undefined values', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={['Michael Scott', undefined]}
      />
    );

    await act(() => user.click(screen.getByText('Michael Scott')));

    await act(() => {
      options.forEach((label) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });
  });

  it('should ignore undefined options', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      '5E8',
      undefined,
      '32S',
      '4B9',
      'MF5',
      'PRD',
      'QAS',
      'HA1',
      'HA2',
    ];
    const value = ['PRD'];

    render(
      <RemoteFilter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={value}
      />
    );

    await act(() => user.click(screen.getByText('PRD')));

    await act(() => {
      options.filter(Boolean).forEach((label) => {
        expect(screen.getAllByText(label)[0]).toBeInTheDocument();
      });
    });
  });
});
